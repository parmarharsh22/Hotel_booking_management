import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({

    destination: (
        req,file,cb
) => {

        cb(null, path.join(
            process.cwd(),
                "src",
                "public",
                "uploads",
                "profile-photos"
            )
        );

    },

    filename: (
        req,
        file,
        cb
    ) => {

        const extension =
            path.extname(file.originalname);

        const randomSlug =
            crypto.randomBytes(6)
                .toString("hex");

        const fileName =
            `${Date.now()}-${randomSlug}${extension}`;

        cb(null, fileName);

    }

});

const fileFilter: multer.Options["fileFilter"] =(
        req,
        file,
        cb
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (
            allowedTypes.includes(file.mimetype)
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                )
            );
        }

    };

export const uploadProfilePhoto =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize: 5 * 1024 * 1024
        }

    });