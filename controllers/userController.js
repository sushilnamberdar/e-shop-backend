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
  const { street, city, state, zip, country, number, firstName, lastName } = req.body;
  console.log("request received to add address", req.body);
  const user = await User.findById(req.user._id);
  user.addresses.push({ street, city, state, zip, country, number, firstName, lastName,isDefault: true });
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


exports.updateAddress = async (req, res) => {
  console.log("request received to update address");
  try {
    const userId = req.user._id;
    const { addressId, street, city, state, zip, country, number, firstName, lastName } = req.body.addressId;

    if (!addressId) return res.status(400).json({ message: 'Address ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    if (firstName) address.firstName = firstName;
    if (lastName) address.lastName = lastName;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zip) address.zip = zip;
    if (number) address.number = number;
    if (country) address.country = country;

    await user.save();

    res.json({ message: 'Address updated', addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
