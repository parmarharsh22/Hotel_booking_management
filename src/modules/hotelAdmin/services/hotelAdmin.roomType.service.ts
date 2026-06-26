import { RoomTypeInterface,RoomTypeUpdateInterface } from "../models/hotelAdmin.roomType.model";
import { RoomTypeModel } from "../models/hotelAdmin.roomType.model";

export class RoomTypeService {

  // listRoomTypes
  async getAllRoomTypes(hotelId: number): Promise<RoomTypeInterface[]> {
    try {
      if (!hotelId) throw new Error("Hotel ID is required.");
      return await RoomTypeModel.getAllRoomTypes(hotelId);
    } catch (err) {
      throw err;
    }
  }

  // showEditRoomType
  async getRoomTypeById(typeId: number, hotelId: number): Promise<any> {
    try {
      if (!typeId)  throw new Error("Room type ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      const roomType = await RoomTypeModel.getRoomTypeById(typeId, hotelId);
      if (!roomType) throw new Error("Room type not found.");
      return roomType;
    } catch (err) {
      throw err;
    }
  }

  // createRoomType
  async createRoomType(roomType: RoomTypeInterface): Promise<RoomTypeInterface> {
    try {
      if (!roomType.type_name)   throw new Error("Room type name is required.");
      if (!roomType.base_price)  throw new Error("Base price is required.");
      if (!roomType.max_adults) throw new Error("Max occupancy is required.");
      if (!roomType.max_children) throw new Error("Max occupancy is required.");
      if (roomType.base_price <= 0) throw new Error("Base price must be greater than 0.");
      if (roomType.max_adults <= 0) throw new Error("Max occupancy must be greater than 0.");
      if (roomType.max_children <= 0) throw new Error("Max occupancy must be greater than 0.");
      return await RoomTypeModel.createRoomType(roomType);
    } catch (err) {
      throw err;
    }
  }

  // updateRoomType
  async updateRoomType(typeId: number, hotelId: number, data: RoomTypeUpdateInterface): Promise<boolean> {
    try {
      if (!typeId)  throw new Error("Room type ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      if (data.base_price && data.base_price <= 0) throw new Error("Base price must be greater than 0.");
      if (data.max_adults && data.max_adults <= 0) throw new Error("Max occupancy must be greater than 0.");
      if (data.max_children && data.max_children <= 0) throw new Error("Max occupancy must be greater than 0.");
      const updated = await RoomTypeModel.updateRoomType(typeId, hotelId, data);
      if (!updated) throw new Error("Room type not found or no changes made.");
      return updated;
    } catch (err) {
      throw err;
    }
  }

  // deleteRoomType
  // if rooms are assigned to this type, MySQL FK error will be caught here
  // and returned as a clean readable message
  async deleteRoomType(typeId: number, hotelId: number): Promise<boolean> {
    try {
      if (!typeId)  throw new Error("Room type ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      const deleted = await RoomTypeModel.deleteRoomType(typeId, hotelId);
      if (!deleted) throw new Error("Room type not found.");
      return deleted;
    } catch (err: any) {
      // MySQL FK constraint error code
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new Error("Cannot delete — rooms are assigned to this type. Reassign them first.");
      }
      throw err;
    }
  }

  // addAmenity
  async addAmenities(typeId: number, amenityIds: number[]): Promise<boolean> {
  try {
    if (!typeId)                throw new Error("Room type ID is required.");
    if (!amenityIds?.length)    throw new Error("At least one amenity ID is required.");
    return await RoomTypeModel.addAmenities(typeId, amenityIds);
  } catch (err) {
    throw err;
  }
}

  // removeAmenity
 async removeAmenities(typeId: number, amenityIds: number[]): Promise<boolean> {
  try {
    if (!typeId)                throw new Error("Room type ID is required.");
    if (!amenityIds?.length)    throw new Error("At least one amenity ID is required.");
    return await RoomTypeModel.removeAmenities(typeId, amenityIds);
  } catch (err) {
    throw err;
  }
}

  // getAllAmenities — for form dropdown
  async getAllAmenities(): Promise<any[]> {
    try {
      return await RoomTypeModel.getAllAmenities();
    } catch (err) {
      throw err;
    }
  }





}
