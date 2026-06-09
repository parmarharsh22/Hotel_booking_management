import { RoomTypeService } from "../services/hotelAdmin.roomType.service";
import { Request,Response } from "express";

const roomTypeService = new RoomTypeService();

export class AdminRoomTypeController {

 async listRoomTypes(req: Request, res: Response) {
    try {
      const hotelId  = (req as any).hotelId as number;
      const roomTypes = await roomTypeService.getAllRoomTypes(hotelId);
      console.log(roomTypes);
      return res.status(200).render("hotelAdmin/room-types", { roomTypes });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async showNewRoomType(req: Request, res: Response) {
    try {
      const amenities = await roomTypeService.getAllAmenities();
      return res.status(200).render("hotelAdmin/room-type-new", { amenities });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async createRoomType(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const files: any = req.files;
      const photo_url = files?.type_photo ? files.type_photo[0].path : null;

      const roomType = {
        hotel_id:      hotelId,
        type_name:     req.body.type_name,
        photo_url,
        description:   req.body.description   || null,
        base_price:    parseFloat(req.body.base_price),
        max_adults: parseInt(req.body.max_adults),
        max_children: parseInt(req.body.max_children), 
      };

      await roomTypeService.createRoomType(roomType);
      return res.redirect("/hotelAdmin/room-types");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async showEditRoomType(req: Request, res: Response) {
    try {
      const hotelId   = (req as any).hotelId as number;
      const typeId    = parseInt(req.params.typeId as any);
      const roomType  = await roomTypeService.getRoomTypeById(typeId, hotelId);
      const amenities = await roomTypeService.getAllAmenities();
      return res.status(200).render("hotelAdmin/room-type-edit", { roomType, amenities });
    } catch (err: any) {
      return res.status(404).json({ message: err.message });
    }
  }

  async updateRoomType(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const typeId  = parseInt(req.params.typeId as any);
      const files: any = req.files;
      const photo_url = files?.type_photo ? files.type_photo[0].path : req.body.existing_photo || null;

      const data = {
        type_name:     req.body.type_name,
        photo_url,
        description:   req.body.description   || null,
        base_price:    parseFloat(req.body.base_price),
        max_adults: parseInt(req.body.max_adults),
        max_children: parseInt(req.body.max_children)
      };

      await roomTypeService.updateRoomType(typeId, hotelId, data);
      return res.redirect("/hotelAdmin/room-types");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

  async deleteRoomType(req: Request, res: Response) {
    try {
      const hotelId = (req as any).hotelId as number;
      const typeId  = parseInt(req.params.typeId as any);
      await roomTypeService.deleteRoomType(typeId, hotelId);
      return res.redirect("/hotelAdmin/room-types");
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }

async addAmenities(req: Request, res: Response) {
  try {
    const typeId     = parseInt(req.params.typeId as any);
    const amenityIds = Array.isArray(req.body.amenity_ids)
      ? req.body.amenity_ids.map(Number)
      : [Number(req.body.amenity_ids)];  // if only one value, wrap it in array

    await roomTypeService.addAmenities(typeId, amenityIds);
    return res.redirect(`/admin/room-types/${typeId}/edit`);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}

  async removeAmenities(req: Request, res: Response) {
  try {
    const typeId     = parseInt(req.params.typeId as any);
    const amenityIds = Array.isArray(req.body.amenity_ids)
      ? req.body.amenity_ids.map(Number)
      : [Number(req.body.amenity_ids)];

    await roomTypeService.removeAmenities(typeId, amenityIds);
    return res.redirect(`/admin/room-types/${typeId}/edit`);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
}
}