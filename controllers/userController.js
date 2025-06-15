const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUser = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  const { name, email, phone, profilePicture } = req.body;
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (profilePicture) updateFields.profilePicture = profilePicture;
  const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true });
  res.json(user);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password updated successfully' });
};

exports.getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ addresses: user.addresses });
};

exports.addAddress = async (req, res) => {
  const { street, city, state, zip, country } = req.body;
  const user = await User.findById(req.user._id);
  user.addresses.push({ street, city, state, zip, country });
  await user.save();
  res.json({ addresses: user.addresses });
};

exports.deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  
  // Filter out the address with the matching ID
  user.addresses = user.addresses.filter(
    address => address._id.toString() !== addressId
  );
  
  await user.save();
  res.json({ addresses: user.addresses });
};