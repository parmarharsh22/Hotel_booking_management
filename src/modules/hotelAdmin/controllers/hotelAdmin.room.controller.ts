import { Request,Response } from "express";
import { RoomService } from "../services/hotelAdmin.room.service";
import { RoomTypeService } from "../services/hotelAdmin.roomType.service";

const roomService = new RoomService();
const roomTypeService = new RoomTypeService()
export class AdminRoomController {

    // GET /admin/rooms
  // hotelId comes from session (injected by tenant.middleware.ts into req.hotelId)
  async listRooms(req: Request, res: Response) {
    try {
       const hotelId = (req as any).hotelId as number;
       console.log(hotelId);
       
    //  const hotelId = 1;
      const rooms = await roomService.getAllRoomsByHotel(hotelId);
      // EJS: render the rooms list page
      return res.status(200).json({rooms});
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /admin/rooms/new
  async showNewRoom(req: Request, res: Response) {
    try {
       const hotelId = (req as any).hotelId as number;
             const roomTypes = await roomTypeService.getAllRoomTypes(hotelId);

      // You can pass room_types here later so the form has a dropdown
      return res.status(200).json({roomTypes});
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // POST /admin/rooms
  // Multer runs before this if photo upload is enabled
  async createRoom(req: Request, res: Response) {
    try {
       const hotelId = (req as any).hotelId as number;
    //  const hotelId = 1;
      const files: any = req.files;
      const photo_url = files?.room_photo ? files.room_photo[0].path : null;
    
      
      const room = {
        hotel_id:       hotelId,
        room_type_id:   parseInt(req.body.room_type_id),
        room_status_id: req.body.room_status_id,
        room_number:    req.body.room_number,
        floor:          req.body.floor ? parseInt(req.body.floor) : null,
        notes:          req.body.notes || null,
      };
      
      
      await roomService.createRoom(room);
      // After create, redirect back to the rooms list
      
      return res.status(200).json({ success: true, message: "Room creation success" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // GET /admin/rooms/:roomId/edit
  // Fetches existing room data to pre-fill the edit form
   async showEditRoom(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
     
      const roomId  = parseInt(req.params.roomId as any);
      
      
      const room = await roomService.getRoomById(roomId, hotelId);
      return res.status(200).json({ room });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }


  // PUT /admin/rooms/:roomId
  // method-override converts the form's POST into PUT
  async updateRoom(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
  
      const roomId  = parseInt(req.params.roomId as any);
    
      
      const files: any = req.files;
      // const photo_url = files?.room_photo ? files.room_photo[0].path : req.body.existing_photo || null;

      const data = {
        room_type_id: parseInt(req.body.room_type_id),
        room_number:  req.body.room_number,
        room_status_id:req.body.room_status_id,
        floor:        req.body.floor ? parseInt(req.body.floor) : null,
        // photo_url,
        notes:        req.body.notes || null,
      };
      // console.log(data);
      
      await roomService.updateRoom(roomId, hotelId, data);

      res.status(200).json("room edited successfully")

    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // DELETE /admin/rooms/:roomId
  // method-override converts the form's POST into DELETE
  async deleteRoom(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const roomId  = parseInt(req.params.roomId as any);

      await roomService.deleteRoom(roomId, hotelId);
      res.status(200).json({message:'Room Deleted Succesfully'})
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }


  // PUT /admin/rooms/:roomId/status
  // Separate endpoint — only changes status, nothing else
  async updateRoomStatus(req: Request, res: Response) {
    try {
      const hotelId     = (req as any).hotelId as number;
      const roomId      = parseInt(req.params.roomId as any);
      const roomStatusId = parseInt(req.body.room_status_id);

      await roomService.updateRoomStatus(roomId, hotelId, roomStatusId);
      return res.status(200).json({message : "Room updated"});
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
  
  // made by siddharth
  async isRoomExists(req: Request, res: Response) {
    console.log("Query:", req.query);
    console.log("Room Number:", req.query.room_number);
    console.log("Hotel ID:", (req as any).hotelId);

    try {
        const roomNumber = Number(req.query.room_number);
        const hotelId = (req as any).hotelId;

        const isExists = await roomService.verifyRoomNumber(
            roomNumber,
            hotelId
        );

        return res.status(200).json({
            exists: isExists
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

// made by siddharth
async getRoomTypes(req: Request, res: Response) {
    try {
        const hotelId = (req as any).hotelId as number;

        const roomTypes =
            await roomTypeService.getAllRoomTypes(hotelId);

        return res.status(200).json({
            success: true,
            data: roomTypes
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async getRoomStatuses(req: Request, res: Response) {

    try {

        const statuses =
            await roomService.getRoomStatuses();

        return res.status(200).json({
            success: true,
            data: statuses
        });

    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load room statuses"
        });
    }
}



}


