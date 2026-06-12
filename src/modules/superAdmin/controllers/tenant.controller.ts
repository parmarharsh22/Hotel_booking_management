import { Request, Response } from "express";
import * as tenantService from "../services/tenant.service";
import { uploadImage } from "../services/imagekit.service";


/**
 * LIST HOTELS
 */
export const listHotels = async (req: Request, res: Response) => {
  try {
    const hotels = await tenantService.listHotels();
    if (req.headers.accept?.includes("application/json")) {
      return res.json(hotels);
    }
    res.render("superAdmin/hotels_list", { hotels });
    // res.send(hotels)
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Failed to fetch hotels");
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await tenantService.listUsers();
    if (req.headers.accept?.includes("application/json")) {
      return res.json(users);
    }
    res.render("superAdmin/users", { users });
    // res.send(hotels)
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Failed to fetch hotels");
  }
};
/**
 * SHOW CREATE PAGE
 */
export const showNewHotel = (req: Request, res: Response) => {
  res.render("superAdmin/hotel-new");
};

/**
 * CREATE HOTEL
 */
// export const createHotel = async (req: Request, res: Response) => {
//     try {
//         await tenantService.createHotel(req.body);
//         // res.redirect("/superadmin/hotels");
//         res.send("hotel added")
//     } catch (err: any) {
//         console.error(err);
//         res.status(500).send(err.message || "Failed to create hotel");
//     }
// };

export const createHotel = async (req: Request, res: Response) => {
  try {
    const files = req.files as Record<string, Express.Multer.File[]>;

    // upload logo if provided
    if (files?.logo_url?.[0]) {
      const file = files.logo_url[0];
      req.body.logo_url = await uploadImage(
        file.buffer,
        `logo-${Date.now()}`,
        "/hotels/logos",
      );
    }

    // upload cover if provided
    if (files?.cover_url?.[0]) {
      const file = files.cover_url[0];
      req.body.cover_url = await uploadImage(
        file.buffer,
        `cover-${Date.now()}`,
        "/hotels/covers",
      );
    }

    await tenantService.createHotel(req.body);
    res.redirect("/superadmin/hotels");
  } catch (err: any) {
    console.error(err);
    res.status(500).send(err.message || "Failed to create hotel");
  }
};

/**
 * GET HOTEL DETAIL
 */
export const getHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.hotelId);
        if (!hotelId) return res.status(400).send("Invalid hotel ID");

        const data = await tenantService.getHotel(hotelId);

        if (req.headers.accept?.includes('application/json')) {
            return res.json(data);
        }

        res.render("superAdmin/hotel-detail");

    } catch (err: any) {
        res.status(500).send("Failed to fetch hotel");
    }
};


/**
 * SHOW EDIT PAGE
 */
export const showEditHotel = async (req: Request, res: Response) => {
  try {
    const hotelId = Number(req.params.hotelId);

    if (!hotelId) {
      return res.status(400).send("Invalid hotel ID");
    }

    const data = await tenantService.getHotel(hotelId);
    // if (req.headers.accept?.includes("application/json")) {
    //   return res.json(data);
    // }
    res.render("superAdmin/hotel-edit", data);
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Failed to load edit page");
  }
};

/**
 * UPDATE HOTEL
 */
// export const updateHotel = async (req: Request, res: Response) => {
//   try {
//     const hotelId = Number(req.params.hotelId);

//     if (!hotelId) {
//       return res.status(400).send("Invalid hotel ID");
//     }

//     await tenantService.updateHotel(hotelId, req.body);

//     res.redirect(`/superadmin/hotels/${hotelId}`);
//   } catch (err: any) {
//     console.error(err);
//     res.status(500).send("Failed to update hotel");
//   }
// };

export const updateHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.hotelId);
        if (!hotelId) return res.status(400).send("Invalid hotel ID");

        const files = req.files as Record<string, Express.Multer.File[]>;

        if (files?.logo_url?.[0]) {
            req.body.logo_url = await uploadImage(
                files.logo_url[0].buffer,
                `logo-${Date.now()}`,
                "/hotels/logos"
            );
        }

        if (files?.cover_url?.[0]) {
            req.body.cover_url = await uploadImage(
                files.cover_url[0].buffer,
                `cover-${Date.now()}`,
                "/hotels/covers"
            );
        }

        await tenantService.updateHotel(hotelId, req.body);
        res.json({ success: true });

    } catch (err: any) {
        res.status(500).send("Failed to update hotel");
    }
};



/**
 * UPDATE STATUS
 */
export const updateHotelStatus = async (req: Request, res: Response) => {
  try {
    const hotelId = Number(req.params.hotelId);
    const statusId = Number(req.body.tenant_status_id);

    if (!hotelId || !statusId) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    await tenantService.updateHotelStatus(hotelId, statusId);

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update status" });
  }
};

/**
 * DELETE HOTEL
 */
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotelId = Number(req.params.hotelId);

    if (!hotelId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid hotel ID" });
    }

    await tenantService.deleteHotel(hotelId);

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete hotel" });
  }
};
