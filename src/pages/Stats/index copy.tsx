import React from 'react';  
import PptxGenJS from 'pptxgenjs';  

const PptxViewer = () => {  
    const createPptx = () => {  
        // 创建一个新的 PPTX 实例  
        const pptx = new PptxGenJS();  
        
        // 添加幻灯片  
        const slide = pptx.addSlide();  
        
        // 添加标题  
        slide.addText('Hello, World!', { x: 1, y: 1, fontSize: 24, color: '363636' });  
        
        // 添加副标题  
        slide.addText('This is a sample PPTX created with pptxgenjs.', { x: 1, y: 1.5, fontSize: 18, color: 'a9a9a9' });  
        
        // 保存文件  
        pptx.writeFile({ fileName: 'SamplePPTX.pptx' });  
    };  

    return (  
        <div>  
            <h1>PPTX 文件生成器</h1>  
            <button onClick={createPptx}>生成 PPTX</button>  
        </div>  
    );  
};  

export default PptxViewer;