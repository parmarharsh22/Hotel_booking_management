import { Request,Response } from "express";
import { RoomService } from "../services/hotelAdmin.room.service";

const roomService = new RoomService();

export class AdminRoomController {

    // GET /admin/rooms
  // hotelId comes from session (injected by tenant.middleware.ts into req.hotelId)
  async listRooms(req: Request, res: Response) {
    try {
      // const hotelId = (req as any).hotelId as number;
      const hotelId = 101;
      const rooms = await roomService.getAllRoomsByHotel(hotelId);
      // EJS: render the rooms list page
      return res.status(200).render("admin/rooms", { rooms });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  // GET /admin/rooms/new
  async showNewRoom(req: Request, res: Response) {
    try {
      // You can pass room_types here later so the form has a dropdown
      return res.status(200).render("admin/room-new");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // POST /admin/rooms
  // Multer runs before this if photo upload is enabled
  async createRoom(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const files: any = req.files;
      const photo_url = files?.room_photo ? files.room_photo[0].path : null;

      const room = {
        hotel_id:       hotelId,
        room_type_id:   parseInt(req.body.room_type_id),
        room_status_id: req.body.room_status_id,
        room_number:    req.body.room_number,
        floor:          req.body.floor ? parseInt(req.body.floor) : null,
        photo_url,
        notes:          req.body.notes || null,
      };
      await roomService.createRoom(room);
      // After create, redirect back to the rooms list
      return res.redirect("/admin/rooms");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // GET /admin/rooms/:roomId/edit
  // Fetches existing room data to pre-fill the edit form
   async showEditRoom(req: Request, res: Response) {
    try {
      // const hotelId = (req as any).hotelId as number;
       const hotelId = 101;
      const roomId  = parseInt(req.params.roomId as any);
      console.log(roomId);
      
      const room = await roomService.getRoomById(roomId, hotelId);
      return res.status(200).render("admin/room-edit", { room });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }


  // PUT /admin/rooms/:roomId
  // method-override converts the form's POST into PUT
  async updateRoom(req: Request, res: Response) {
    try {
      // const hotelId = (req as any).hotelId as number;
      const hotelId = 101;
      const roomId  = parseInt(req.params.roomId as any);
      console.log(roomId);
      
      const files: any = req.files;
      const photo_url = files?.room_photo ? files.room_photo[0].path : req.body.existing_photo || null;

      const data = {
        room_type_id: parseInt(req.body.room_type_id),
        room_number:  req.body.room_number,
        floor:        req.body.floor ? parseInt(req.body.floor) : null,
        photo_url,
        notes:        req.body.notes || null,
      };
      await roomService.updateRoom(roomId, hotelId, data);
      // return res.status(200).json({roomId , hotelId  ,data})
       res.status(303).location("/hotelAdmin/rooms").end();
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

   // DELETE /admin/rooms/:roomId
  // method-override converts the form's POST into DELETE
  async deleteRoom(req: Request, res: Response) {
    try {
      // const hotelId = (req as any).hotelId as number;
      const hotelId = 1;
      const roomId  = parseInt(req.params.roomId as any);

      await roomService.deleteRoom(roomId, hotelId);
      return res.redirect("/admin/rooms");
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
      return res.redirect("hotelAdmin/rooms");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }


}