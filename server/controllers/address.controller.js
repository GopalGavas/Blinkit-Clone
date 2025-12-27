import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const addAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const { address_line, city, state, pincode, country, delivery_mobile } =
      req.body;

    if (
      !address_line ||
      !city ||
      !state ||
      !pincode ||
      !country ||
      !delivery_mobile
    ) {
      return res.status(400).json({
        message: "All required address fields must be provided",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const existingAddress = await AddressModel.findOne({
      userId,
      status: true,
    });

    const isDefault = !existingAddress;

    const address = await AddressModel.create({
      address_line,
      city,
      state,
      pincode,
      country,
      delivery_mobile,
      userId,
      isDefault,
    });

    await UserModel.updateOne(
      { _id: userId },
      { $push: { address_details: address._id } }
    );

    return res.status(201).json({
      message: "Address created successfully",
      error: false,
      success: true,
      data: address,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const getAddressController = async (req, res) => {
  try {
    const userId = req.userId;

    const addresses = await AddressModel.find({
      userId,
      status: true,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      message: "Address list fetched successfully",
      error: false,
      success: true,
      data: addresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const updateAddressController = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;
    const {
      address_line,
      city,
      state,
      country,
      pincode,
      delivery_mobile,
      isDefault,
    } = req.body;

    if (!addressId) {
      return res.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    // If setting this address as default,
    // unset default from all other addresses
    if (isDefault === true) {
      await AddressModel.updateMany(
        { userId, status: true },
        { isDefault: false }
      );
    }

    const updatedAddress = await AddressModel.findOneAndUpdate(
      { _id: addressId, userId, status: true },
      {
        ...(address_line && { address_line }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
        ...(pincode && { pincode }),
        ...(delivery_mobile && { delivery_mobile }),
        ...(typeof isDefault === "boolean" && { isDefault }),
      },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        message: "Address not found or unauthorized",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Address updated successfully",
      error: false,
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const deleteAddressController = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({
        message: "Address ID is required",
        error: true,
        success: false,
      });
    }

    const address = await AddressModel.findOne({
      _id: addressId,
      userId,
      status: true,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
        error: true,
        success: false,
      });
    }

    await AddressModel.updateOne(
      { _id: addressId },
      { status: false, isDefault: false }
    );

    // reassign default if needed
    if (address.isDefault) {
      const nextDefault = await AddressModel.findOne({
        userId,
        status: true,
      }).sort({ createdAt: -1 });

      if (nextDefault) {
        await AddressModel.updateOne(
          { _id: nextDefault._id },
          { isDefault: true }
        );
      }
    }

    return res.json({
      message: "Address deleted successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};
