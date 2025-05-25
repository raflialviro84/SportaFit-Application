// server/controllers/userController.js
const User = require('../models/userModel');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Format birth_date to birthDate (YYYY-MM-DD) for frontend
    const userObj = user.toJSON();
    if (userObj.birth_date) {
      // If already string in YYYY-MM-DD, use as is. If Date, format. Else, null.
      if (typeof userObj.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date;
      } else if (userObj.birth_date instanceof Date && !isNaN(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date.toISOString().slice(0, 10);
      } else {
        userObj.birthDate = null;
      }
    } else {
      userObj.birthDate = null;
    }
    delete userObj.birth_date;
    res.json({ user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (with birth_date validation)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, birthDate, photoUrl } = req.body;
    // Validate birthDate (YYYY-MM-DD, not future, age 10-120)
    let birth_date = null;
    if (birthDate) {
      const date = new Date(birthDate);
      const now = new Date();
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
      }
      if (date > now) {
        return res.status(400).json({ message: 'Tanggal lahir tidak boleh di masa depan' });
      }
      const age = now.getFullYear() - date.getFullYear();
      if (age < 10 || age > 120) {
        return res.status(400).json({ message: 'Usia harus antara 10 dan 120 tahun' });
      }
      birth_date = date;
    }
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (birth_date) user.birth_date = birth_date;
    if (photoUrl) user.photoUrl = photoUrl;
    await user.save();
    // Format birth_date to birthDate (YYYY-MM-DD) for frontend
    const userObj = user.toJSON();
    if (userObj.birth_date) {
      // If already string in YYYY-MM-DD, use as is. If Date, format. Else, null.
      if (typeof userObj.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date;
      } else if (userObj.birth_date instanceof Date && !isNaN(userObj.birth_date)) {
        userObj.birthDate = userObj.birth_date.toISOString().slice(0, 10);
      } else {
        userObj.birthDate = null;
      }
    } else {
      userObj.birthDate = null;
    }
    delete userObj.birth_date;
    res.json({ message: 'Profil berhasil diperbarui', user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy(); // This will delete the user from the database

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: error.message });
  }
};
