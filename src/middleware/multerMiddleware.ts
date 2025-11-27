import multer from "multer";
// meyata puluwan file ekata disk eke or ram eke rempory store kara ganna
//memory
const storage = multer.memoryStorage();

export const uploadMulter = multer({ storage });  //storage : storage