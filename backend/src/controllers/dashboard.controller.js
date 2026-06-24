import {
  AuditLog,
  Crop,
  Farmer,
  Market,
  Price,
  Subscription,
  User
} from '../models/index.js';

const starterCrops = [
  { name: 'Maize', name_sw: 'Mahindi', category: 'Grains', unit: 'kg' },
  { name: 'Rice', name_sw: 'Mchele', category: 'Grains', unit: 'kg' },
  { name: 'Beans', name_sw: 'Maharage', category: 'Pulses', unit: 'kg' },
  { name: 'Cassava', name_sw: 'Muhogo', category: 'Roots', unit: 'kg' },
  { name: 'Sunflower', name_sw: 'Alizeti', category: 'Oil seeds', unit: 'kg' }
];

const starterMarkets = [
  { name: 'Kariakoo', region: 'Dar es Salaam', district: 'Ilala' },
  { name: 'Soko Kuu Mbeya', region: 'Mbeya', district: 'Mbeya Urban' },
  { name: 'Morogoro Central', region: 'Morogoro', district: 'Morogoro Urban' },
  { name: 'Dodoma Majengo', region: 'Dodoma', district: 'Dodoma Urban' },
  { name: 'Singida Main', region: 'Singida', district: 'Singida Urban' }
];

const starterPrices = [
  ['Maize', 'Kariakoo', 850, 790, 900],
  ['Rice', 'Soko Kuu Mbeya', 2500, 2380, 2650],
  ['Beans', 'Morogoro Central', 1200, 1120, 1300],
  ['Cassava', 'Dodoma Majengo', 450, 410, 500],
  ['Sunflower', 'Singida Main', 1100, 1040, 1180]
];

const ensureMarketData = async () => {
  const cropCount = await Crop.count();
  const marketCount = await Market.count();
  const priceCount = await Price.count();

  if (cropCount === 0) {
    await Crop.bulkCreate(starterCrops);
  }

  if (marketCount === 0) {
    await Market.bulkCreate(starterMarkets);
  }

  if (priceCount === 0) {
    const crops = await Crop.findAll();
    const markets = await Market.findAll();
    const cropByName = new Map(crops.map((crop) => [crop.name, crop]));
    const marketByName = new Map(markets.map((market) => [market.name, market]));

    await Price.bulkCreate(
      starterPrices.map(([cropName, marketName, price, low, high]) => ({
        crop_id: cropByName.get(cropName).id,
        market_id: marketByName.get(marketName).id,
        price,
        price_low: low,
        price_high: high,
        currency: 'TZS',
        unit: 'kg',
        recorded_at: new Date()
      }))
    );
  }
};

const formatPrice = (price) => ({
  id: price.id,
  crop: price.Crop?.name || 'Unknown crop',
  crop_sw: price.Crop?.name_sw || null,
  market: price.Market?.name || 'Unknown market',
  region: price.Market?.region || 'Unknown region',
  district: price.Market?.district || null,
  unit: price.unit,
  currency: price.currency,
  price: Number(price.price),
  low: Number(price.price_low || price.price),
  high: Number(price.price_high || price.price),
  trend: '+0.0%',
  status: 'Verified',
  updated: price.recorded_at || price.created_at
});

const getLatestPrices = async (where = {}) => {
  await ensureMarketData();

  return Price.findAll({
    where,
    include: [
      { model: Crop, attributes: ['id', 'name', 'name_sw', 'category', 'unit'] },
      { model: Market, attributes: ['id', 'name', 'region', 'district'] }
    ],
    order: [['recorded_at', 'DESC'], ['created_at', 'DESC']],
    limit: 25
  });
};

const buildWeeklySeries = (prices) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const maize = prices.find((price) => price.Crop?.name === 'Maize');
  const rice = prices.find((price) => price.Crop?.name === 'Rice');
  const beans = prices.find((price) => price.Crop?.name === 'Beans');

  return days.map((day, index) => ({
    day,
    maize: Math.round(Number(maize?.price || 850) * (0.96 + index * 0.01)),
    rice: Math.round(Number(rice?.price || 2500) * (0.97 + index * 0.007)),
    beans: Math.round(Number(beans?.price || 1200) * (1.03 - index * 0.008))
  }));
};

const getRegionalActivity = async () => {
  const markets = await Market.findAll({ where: { is_active: true } });
  const prices = await Price.findAll({ include: [{ model: Market, attributes: ['region'] }] });
  const counts = new Map();

  markets.forEach((market) => counts.set(market.region || 'Unknown', 0));
  prices.forEach((price) => {
    const region = price.Market?.region || 'Unknown';
    counts.set(region, (counts.get(region) || 0) + 1);
  });

  return [...counts.entries()].map(([region, updates]) => ({ region, updates }));
};

export const getAdminDashboard = async (req, res) => {
  try {
    const latestPrices = await getLatestPrices();
    const [farmerCount, marketCount, cropCount, users, regionalActivity, auditLogs] = await Promise.all([
      Farmer.count(),
      Market.count({ where: { is_active: true } }),
      Crop.count({ where: { is_active: true } }),
      User.findAll({ attributes: ['id', 'email', 'phone', 'role', 'is_active', 'last_login', 'created_at'], order: [['created_at', 'DESC']], limit: 20 }),
      getRegionalActivity(),
      AuditLog.findAll({ order: [['created_at', 'DESC']], limit: 10 })
    ]);

    const markets = await Market.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    const farmers = await Farmer.findAll({ order: [['created_at', 'DESC']], limit: 20 });

    res.json({
      serverTime: new Date().toISOString(),
      stats: {
        activeFarmers: farmerCount,
        marketsCovered: marketCount,
        activeCrops: cropCount,
        priceUpdates: latestPrices.length,
        smsDelivered: 0,
        ussdSessions: 0
      },
      prices: latestPrices.map(formatPrice),
      charts: {
        weeklyPrices: buildWeeklySeries(latestPrices),
        regionalActivity
      },
      markets: markets.map((market) => ({
        id: market.id,
        name: market.name,
        region: market.region,
        district: market.district,
        status: market.is_active ? 'Active' : 'Inactive'
      })),
      farmers: farmers.map((farmer) => ({
        id: farmer.id,
        name: farmer.full_name,
        region: farmer.region,
        district: farmer.district,
        village: farmer.village,
        phone: farmer.phone,
        joined: farmer.created_at
      })),
      users,
      auditFeed: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        created_at: log.created_at
      }))
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load admin dashboard' });
  }
};

export const getFarmerDashboard = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });
    const latestPrices = await getLatestPrices();
    const regionPrices = farmer?.region
      ? latestPrices.filter((price) => price.Market?.region === farmer.region)
      : [];
    const subscriptions = farmer
      ? await Subscription.findAll({
          where: { farmer_id: farmer.id, is_active: true },
          include: [
            { model: Crop, attributes: ['id', 'name', 'name_sw'] },
            { model: Market, attributes: ['id', 'name', 'region'] }
          ],
          order: [['created_at', 'DESC']]
        })
      : [];

    res.json({
      serverTime: new Date().toISOString(),
      profile: farmer,
      stats: {
        watchedCrops: subscriptions.length,
        nearbyMarkets: farmer?.region ? new Set(regionPrices.map((price) => price.market_id)).size : 0,
        latestPrices: latestPrices.length,
        alerts: subscriptions.length
      },
      recommendedPrices: (regionPrices.length ? regionPrices : latestPrices).slice(0, 8).map(formatPrice),
      allPrices: latestPrices.map(formatPrice),
      weeklyPrices: buildWeeklySeries(latestPrices),
      subscriptions: subscriptions.map((item) => ({
        id: item.id,
        crop: item.Crop?.name,
        market: item.Market?.name || 'All markets',
        notification_type: item.notification_type
      })),
      alerts: latestPrices.slice(0, 5).map((price) => ({
        id: price.id,
        title: `${price.Crop?.name} price updated`,
        message: `${price.Market?.name}: ${Number(price.price).toLocaleString()} ${price.currency}/${price.unit}`,
        created_at: price.recorded_at || price.created_at
      }))
    });
  } catch (error) {
    console.error('Farmer dashboard error:', error);
    res.status(500).json({ message: 'Failed to load farmer dashboard' });
  }
};

export const createPrice = async (req, res) => {
  try {
    const { crop, market, region, district, price, unit = 'kg' } = req.body;
    const numericPrice = Number(price);

    if (!crop || !market || !numericPrice || numericPrice <= 0) {
      return res.status(400).json({ message: 'Crop, market, and valid price are required' });
    }

    const [cropRecord] = await Crop.findOrCreate({
      where: { name: crop },
      defaults: { name: crop, unit, is_active: true }
    });
    const [marketRecord] = await Market.findOrCreate({
      where: { name: market },
      defaults: { name: market, region, district, is_active: true }
    });

    if ((region || district) && (!marketRecord.region || !marketRecord.district)) {
      await marketRecord.update({
        region: marketRecord.region || region,
        district: marketRecord.district || district
      });
    }

    const created = await Price.create({
      crop_id: cropRecord.id,
      market_id: marketRecord.id,
      price: numericPrice,
      price_low: Math.round(numericPrice * 0.94),
      price_high: Math.round(numericPrice * 1.06),
      currency: 'TZS',
      unit,
      recorded_by: req.user.id,
      recorded_at: new Date()
    });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PRICE_CREATED',
      entity_type: 'Price',
      entity_id: created.id,
      details: { crop, market, price: numericPrice }
    });

    const saved = await Price.findByPk(created.id, {
      include: [
        { model: Crop, attributes: ['id', 'name', 'name_sw', 'category', 'unit'] },
        { model: Market, attributes: ['id', 'name', 'region', 'district'] }
      ]
    });

    res.status(201).json({ message: 'Price created', price: formatPrice(saved) });
  } catch (error) {
    console.error('Create price error:', error);
    res.status(500).json({ message: 'Failed to create price' });
  }
};

export const verifyPrice = async (req, res) => {
  try {
    const price = await Price.findByPk(req.params.id);

    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: 'PRICE_VERIFIED',
      entity_type: 'Price',
      entity_id: price.id
    });

    res.json({ message: 'Price verified' });
  } catch (error) {
    console.error('Verify price error:', error);
    res.status(500).json({ message: 'Failed to verify price' });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer profile not found' });
    }

    const { crop_id, market_id = null, notification_type = 'sms' } = req.body;

    if (!crop_id) {
      return res.status(400).json({ message: 'Crop is required' });
    }

    const [subscription] = await Subscription.findOrCreate({
      where: {
        farmer_id: farmer.id,
        crop_id,
        market_id
      },
      defaults: {
        farmer_id: farmer.id,
        crop_id,
        market_id,
        notification_type,
        is_active: true
      }
    });

    res.status(201).json({ message: 'Subscription saved', subscription });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Failed to save subscription' });
  }
};
