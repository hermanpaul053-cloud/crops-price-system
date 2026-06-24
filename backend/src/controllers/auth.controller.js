import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
    
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
    
    return { accessToken, refreshToken };
};

const isDevelopment = process.env.NODE_ENV !== 'production';

const loginFailure = (res, status, message, details) => {
    return res.status(status).json({
        message,
        ...(isDevelopment && details ? { details } : {})
    });
};

const getCookie = (req, name) => {
    if (req.cookies?.[name]) {
        return req.cookies[name];
    }

    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map((cookie) => {
            const [key, ...value] = cookie.trim().split('=');
            return [key, decodeURIComponent(value.join('='))];
        })
    );

    return cookies[name] || null;
};

export const registerFarmer = async (req, res) => {
    try {
        const { email, password, full_name, phone, region, district, village } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Email, password, and full name are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({
            email,
            password,
            phone,
            role: 'farmer'
        });

        const farmer = await Farmer.create({
            user_id: user.id,
            full_name,
            phone,
            region,
            district,
            village
        });

        const tokens = generateTokens(user);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Registration successful',
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                farmer: farmer
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        if (!email || !password) {
            return loginFailure(res, 400, 'Email and password are required');
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return loginFailure(res, 401, 'Invalid credentials', 'No user found for this email');
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return loginFailure(res, 401, 'Invalid credentials', 'Password comparison failed');
        }

        if (!user.is_active) {
            return loginFailure(res, 403, 'Account is disabled');
        }

        await user.update({ last_login: new Date() });

        let profile = null;
        if (user.role === 'farmer') {
            profile = await Farmer.findOne({ where: { user_id: user.id } });
        } else if (user.role === 'admin') {
            profile = await Admin.findOne({ where: { user_id: user.id } });
        }

        const tokens = generateTokens(user);

        const cookieMaxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: cookieMaxAge
        });

        try {
            await AuditLog.create({
                user_id: user.id,
                action: 'LOGIN',
                entity_type: 'User',
                entity_id: user.id,
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            });
        } catch (auditError) {
            console.error('Audit log failed:', auditError.message);
        }

        res.json({
            message: 'Login successful',
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Logout failed' });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = getCookie(req, 'refreshToken');
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user || !user.is_active) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const tokens = generateTokens(user);
        res.json({
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await user.update({ 
            reset_token: otp,
            reset_token_expiry: otpExpiry
        });

        // Send OTP via SMS/Email (implementation depends on provider)
        // await sendOTP(user.phone, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            where: { 
                email,
                reset_token: otp,
                reset_token_expiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await user.update({
            password: newPassword,
            reset_token: null,
            reset_token_expiry: null
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset password' });
    }
};
