import React, { useEffect, useRef } from 'react';  
import PptxGenJS from 'pptxgenjs';  

// const PptPreview: React.FC<{ file: string }> = ({ file }) => {  
//   const pptContainerRef = useRef<HTMLDivElement | null>(null);  

//   useEffect(() => {  
//     const renderPpt = async () => {  
//       const pptx = new PptxGenJS();  
//       try {  
//         const response = await fetch(file);  
//         const blob = await response.blob();  
//         const arrayBuffer = await blob.arrayBuffer();  

//         // 加载PPT文件  
//         await pptx.load(arrayBuffer);  

//         // 创建HTML元素来显示幻灯片  
//         if (pptContainerRef.current) {  
//           pptx.render(pptContainerRef.current);  
//         }  
//       } catch (error) {  
//         console.error('Error loading PPT:', error);  
//       }  
//     };  

//     if (file) {  
//       renderPpt();  
//     }  
//   }, [file]);  

//   return <div ref={pptContainerRef} style={{ width: '100%', height: '500px' }} />;  
// };  
const PptPreview = ({ file }) => {  
  if (!file) return <div>无有效文件链接</div>;  

  // Google Docs Viewer URL  
  const googleSlidesURL = `https://docs.google.com/gview?url=${file}&embedded=true`;  

  return (  
    <iframe  
      src={googleSlidesURL}  
      style={{  
        width: '100%',  
        height: '600px',  
        border: 'none'  
      }}  
      allowFullScreen  
    />  
  );  
};  

// 正确导出组件  
export default PptPreview;