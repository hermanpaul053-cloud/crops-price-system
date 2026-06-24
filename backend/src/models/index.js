import User from './User.js';
import Farmer from './Farmer.js';
import Admin from './Admin.js';
import AuditLog from './AuditLog.js';
import Crop from './Crop.js';
import Market from './Market.js';
import Price from './Price.js';
import Subscription from './Subscription.js';

Crop.hasMany(Price, { foreignKey: 'crop_id' });
Price.belongsTo(Crop, { foreignKey: 'crop_id' });

Market.hasMany(Price, { foreignKey: 'market_id' });
Price.belongsTo(Market, { foreignKey: 'market_id' });

Farmer.hasMany(Subscription, { foreignKey: 'farmer_id' });
Subscription.belongsTo(Farmer, { foreignKey: 'farmer_id' });
Crop.hasMany(Subscription, { foreignKey: 'crop_id' });
Subscription.belongsTo(Crop, { foreignKey: 'crop_id' });
Market.hasMany(Subscription, { foreignKey: 'market_id' });
Subscription.belongsTo(Market, { foreignKey: 'market_id' });

export { User, Farmer, Admin, AuditLog, Crop, Market, Price, Subscription };
