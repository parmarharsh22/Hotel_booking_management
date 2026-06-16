import { RoomInterface,RoomUpdateInterface } from "../models/hotelAdmin.room.model";
import { RoomModel } from "../models/hotelAdmin.room.model";

export class RoomService {

  // listRooms — just needs a valid hotelId
  async getAllRoomsByHotel(hotelId: number): Promise<RoomInterface[]> {
    try {
      if (!hotelId) throw new Error("Hotel ID is required.");
      const rooms = await RoomModel.getAllRoomsByHotel(hotelId);
      return rooms;
    } catch (err) {
      throw err;
    }
  }

  // showEditRoom — needs both roomId and hotelId
  async getRoomById(roomId: number, hotelId: number): Promise<RoomInterface> {
    try {
      if (!roomId)  throw new Error("Room ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");

      const room = await RoomModel.getRoomById(roomId, hotelId);
      if (!room) throw new Error("Room not found.");
      return room;
    } catch (err) {
      throw err;
    }
  }

  // createRoom — validate required fields before hitting DB
  async createRoom(room: RoomInterface): Promise<RoomInterface> {
    try {
      if (!room.hotel_id)       throw new Error("Hotel ID is required.");
      if (!room.room_type_id)   throw new Error("Room type is required.");
      if (!room.room_status_id) throw new Error("Room status is required.");
      if (!room.room_number)    throw new Error("Room number is required.");

      const created = await RoomModel.createRoom(room);
      return created;
    } catch (err) {
      throw err;
    }
  }

  // updateRoom — at least one field must be present to bother updating
  async updateRoom(roomId: number, hotelId: number, data: RoomUpdateInterface): Promise<boolean> {
    try {
      if (!roomId)  throw new Error("Room ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");
      if (!data.room_number && !data.room_type_id) {
        throw new Error("Provide at least room_number or room_type_id to update.");
      }

      const updated = await RoomModel.updateRoom(roomId, hotelId, data);
      if (!updated) throw new Error("Room not found or no changes made.");
      return updated;
    } catch (err) {
      throw err;
    }
  }

  // deleteRoom
  async deleteRoom(roomId: number, hotelId: number): Promise<boolean> {
    try {
      if (!roomId)  throw new Error("Room ID is required.");
      if (!hotelId) throw new Error("Hotel ID is required.");

      const deleted = await RoomModel.deleteRoom(roomId, hotelId);
      if (!deleted) throw new Error("Room not found or already deleted.");
      return deleted;
    } catch (err) {
      throw err;
    }
  }

  // updateRoomStatus — only needs roomId, hotelId, and the new statusId
  async updateRoomStatus(roomId: number, hotelId: number, roomStatusId: number): Promise<boolean> {
    try {
      if (!roomId)       throw new Error("Room ID is required.");
      if (!hotelId)      throw new Error("Hotel ID is required.");
      if (!roomStatusId) throw new Error("Room status ID is required.");

      const updated = await RoomModel.updateRoomStatus(roomId, hotelId, roomStatusId);
      if (!updated) throw new Error("Room not found.");
      return updated;
    } catch (err) {
      throw err;
    }
  }
  
  async verifyRoomNumber(
    room_number: number,
    hotelId: number
): Promise<boolean> {

    return RoomModel.VerifyRoomExistence(
        room_number,
        hotelId
    );
}


async getRoomStatuses() {
        try {

            const statuses =
                await RoomModel.getRoomStatuses();

            return statuses;

        } catch (error) {
            throw error;
        }
    }



}

