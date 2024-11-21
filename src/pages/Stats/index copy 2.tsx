import React, { useState } from 'react';  
import JSZip from 'jszip';  
import marked from 'marked'; // 引入 marked 库来转换 Markdown 为 HTML  

const PptxPreview = () => {  
    const [slides, setSlides] = useState([]);  

    const handleFileChange = (event) => {  
        const file = event.target.files[0];  
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {  
            readPPTXFile(file);  
        } else {  
            alert('请上传有效的 PPTX 文件');  
        }  
    };  

    const readPPTXFile = async (file) => {  
        const zip = new JSZip();  
        const contents = await zip.loadAsync(file);  

        const slidePromises = [];  
        contents.forEach((relativePath, file) => {  
            if (relativePath.startsWith("ppt/slides/slide") && relativePath.endsWith(".xml")) {  
                slidePromises.push(file.async("string"));  
            }  
        });  

        const slideContents = await Promise.all(slidePromises);  
        const slideMarkup = slideContents.map((slideXml, index) => {  
            const parser = new DOMParser();  
            const xmlDoc = parser.parseFromString(slideXml, "text/xml");  

            // 提取文本内容和样式  
            const shapes = Array.from(xmlDoc.getElementsByTagName('p:sp'));  

            return (  
                <div key={index} style={{ border: '1px solid black', marginBottom: '10px', padding: '10px' }}>  
                    <h3>幻灯片 {index + 1}</h3>  
                    {shapes.map((shape) => {  
                        const inputText = shape.getElementsByTagName('a:t');  
                        const markdownText = Array.from(inputText).map((textNode, nodeIndex) => {  
                            // 假设我们会将某些文本格式化为 Markdown  
                            const text = textNode.textContent;  
                            // 这里你可以应用一些逻辑来决定如何转换  
                            // 例如，如果文本包含特定标记，则进行格式化  
                            return ` ${text}`; // 这将简单地返回文本，可以根据需求替换为其他 Markdown 语法  
                        }).join('');  

                        // 使用 marked 库将 Markdown 转换为 HTML  
                        return (  
                            <div key={shape.getAttribute('id')} dangerouslySetInnerHTML={{ __html: marked(markdownText) }} />  
                        );  
                    })}  
                </div>  
            );  
        });  

        setSlides(slideMarkup);  
    };  

    return (  
        <div>  
            <h1>PPTX 文件预览</h1>  
            <input type="file" accept=".pptx" onChange={handleFileChange} />  
            <div id="preview" style={{ marginTop: '20px' }}>  
                {slides}  
            </div>  
        </div>  
    );  
};  

export default PptxPreview;