import { diskStorage, memoryStorage } from 'multer';
import type { Request } from 'express';
import type { IMulterFile } from '../../interfaces/multerInterface';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { StorageEnum } from 'src/common/enums/multer.enum';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const cloudMulterConfig = ({
    storageApproach = StorageEnum.MEMORY,
     validation = [],
     maxSize = 2
     }: {
     storageApproach: StorageEnum,   
     validation?:string[],
     maxSize?:number
      }):MulterOptions => {
    
    return {

  storage:
      storageApproach === StorageEnum.MEMORY
       ? memoryStorage()
       : diskStorage({
        destination: tmpdir(),
        filename: function (
        req: Request,
        file: Express.Multer.File,
        callback,
    ) {
    callback(null, `${randomUUID()} ${file.originalname}`);
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