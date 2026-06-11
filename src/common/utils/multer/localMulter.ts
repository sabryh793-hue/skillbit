import { diskStorage } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { IMulterFile } from '../../interfaces/multerInterface';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';


export const localFileUpload = ({
     folder = 'public',
     validation = [],
     maxSize = 2
     }: {
     folder: string,
     validation?:string[],
     maxSize?:number
      }):MulterOptions => {//if user don't provide folder name then it will be 'public' by default .
    let bathePath = `uploads/${folder}`;//bathePath => it will store a relative path in it (like ./uploads/avatar)
  
    return {

        storage: diskStorage({
            
            destination(req: Request, file: Express.Multer.File, callback: Function) {
                const fullPath = path.resolve(`./${bathePath}`);//path.resolve() returns the absolute path of the given path [like C:\Users\HP\Desktop\project\uploads\avatar]
                if (!existsSync(fullPath)) {//if folder does not exist then create it
                    mkdirSync(fullPath, { recursive: true });//recursive:true means create nested folder if not exist
                }
                callback(null, fullPath);
            },

            filename(req: Request, file: IMulterFile, callback: Function) {
                const fileName = randomUUID() + '_' + Date.now() + '_' + file.originalname;
                file.finalPath = bathePath + `/${fileName}`;//here to store in DB we used the relative path to access it later on,but in the destination function we used the absolute path to store the file in the server
                callback(null, fileName);
            },
        }),

        fileFilter: (req: Request, file: IMulterFile, callback: Function) => {
            if (validation.includes(file.mimetype)) {
                callback(null,true);
                
            } else {
                callback(new BadRequestException);
            }
        },

        limits: {
            fileSize: maxSize * 1024 * 1024, // Convert MB to bytes
        },
    }
}
//#################IMPORTANT NOTEEE  #####################

//  relative path: : "من مكان المشروع الحالي"
//  absolute path : "المكان الكامل على الجهاز"

// We store a relative path (e.g., "uploads/avatar/file.png") instead of an absolute path
// (e.g., "C:\\project\\uploads\\avatar\\file.png") for several reasons:
// 1. Cross-platform: Absolute paths depend on the OS (Windows vs Linux), so they may break
//    when deploying the app to a different environment.
// 2. Portability: The project can be moved or deployed without changing stored file paths.
// 3. Public access: Relative paths can be easily converted into URLs
//    (e.g., http://localhost:3000/uploads/avatar/file.png) for frontend use.
// 4. Security: Avoid exposing internal server file system structure.
// 5. Clean DB design: We store only what we need to locate and serve the file, not system-specific details.