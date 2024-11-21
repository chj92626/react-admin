import React, { useState, ChangeEvent } from 'react';  
import JSZip from 'jszip';  
import { XMLParser } from 'fast-xml-parser';  
import ReactMarkdown from 'react-markdown';  

// 定义幻灯片内容的类型  
interface Slide {  
  id: number;  
  content: string;  
}  

const PptxViewer: React.FC = () => {  
  const [slides, setSlides] = useState<Slide[]>([]); // 初始化 slides 状态为 Slide 类型数组  

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {  
    const file = event.target.files?.[0]; // 确保安全获取文件  
    if (  
      file &&  
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"  
    ) {  
      readPPTXFile(file);  
    } else {  
      alert("请上传一个有效的 PPTX 文件");  
    }  
  };  

  const readPPTXFile = async (file: File) => {  
    const zip = new JSZip();  
    const contents = await zip.loadAsync(file);  
  
    const slidePromises: Promise<string>[] = [];  
    // 提取所有幻灯片 XML 文件  
    contents.forEach((relativePath, file) => {  
      if (  
        relativePath.startsWith("ppt/slides/slide") &&  
        relativePath.endsWith(".xml")  
      ) {  
        slidePromises.push(file.async("string")); // 异步读取文件内容  
      }  
    });  
  
    const slideContents = await Promise.all(slidePromises);  
    const slides = slideContents.map((slideXml, index) => {  
      const parser = new XMLParser();  
      const jsonObj = parser.parse(slideXml); // 将 XML 解析为 JSON  
  
      // 这里可以根据需要打印或检查 jsonObj  
      console.log(jsonObj); // 调试输出  
  
      const slide = jsonObj["p:sld"]; // 获取幻灯片内容  
      if (!slide || !slide["p:sp"]) {  
        return {  
          id: index,  
          content: "无法解析幻灯片内容",  
        };  
      }  
  
      // 提取文本内容  
      const texts = slide["p:sp"].map((sp: any) => {  
        const txBody = sp["p:txBody"];  
        const paragraphs = txBody?.["a:p"];  
  
        if (Array.isArray(paragraphs)) {  
          return paragraphs.map((p: any) => {  
            const textElements = p["a:r"];  
            return Array.isArray(textElements)  
              ? textElements.map((t: any) => t["a:t"]).join(" ")  
              : "";  
          }).join("\n");  
        }  
  
        return "";  
      });  
  
      return {  
        id: index,  
        content: texts.join("\n\n") || "幻灯片没有文本内容",  
      };  
    });  
  
    setSlides(slides); // 更新状态以显示幻灯片内容  
  };  

  return (  
    <div>  
      <h1>PPTX 文件预览</h1>  
      <input type='file' accept='.pptx' onChange={handleFileChange} />  
      <div style={{ marginTop: "20px" }}>  
        {slides.length > 0 &&  
          slides.map((slide) => (  
            <div  
              key={slide.id}  
              style={{  
                border: "1px solid black",  
                marginBottom: "10px",  
                padding: "10px",  
              }}  
            >  
              <h3>幻灯片 {slide.id + 1}</h3>  
              <ReactMarkdown>{slide.content}</ReactMarkdown>  
            </div>  
          ))}  
      </div>  
    </div>  
  );  
};  

export default PptxViewer;