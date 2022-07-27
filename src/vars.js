import { IoIosSettings } from "react-icons/io";
import { DiJavascript1, DiPhp, DiJava } from "react-icons/di";
import { AiFillFileText, AiFillFileImage, AiFillFilePpt,AiFillPlayCircle, AiFillFile } from "react-icons/ai";

export const menus = ["files", "vault", "links"];
export const viewableType = ["image/png","image/jpeg","application/pdf", "video/mp4", "video/webm"];
export const filesWithoutThumb = {
  exe: <IoIosSettings />,
  iso: <IoIosSettings />,
  msi: <IoIosSettings />,
  js: <DiJavascript1 />,
  php: <DiPhp />,
  txt: <AiFillFileText />,
  css: <AiFillFileText />,
  html: <AiFillFileText />,
  java: <DiJava />,
  png: <AiFillFileImage />,
  jpg: <AiFillFileImage />,
  jpeg: <AiFillFileImage />,
  pdf: <AiFillFileText />,
  pptx: <AiFillFilePpt />,
  docx: <AiFillFileText />,
  hwp: <AiFillFileText />,
  hwpx: <AiFillFileText />,
  mp4: <AiFillPlayCircle />,
  avi: <AiFillPlayCircle />,
  
};
export const unindexed = <AiFillFile />
