import React, { Component } from "react";
import { PPTXViewer } from "react-pptx-preview";

class PPTXPreview extends Component {
  state = {
    pptxUrl: "https://dev-nts2024-truthaid-s3.truth-ai.com.cn/public/test.pptx",
  };

  render() {
    const { pptxUrl } = this.state;

    return (
      <div>
        <h1>PPTX 预览</h1>
        {pptxUrl ? (
          <PPTXViewer fileUrl={pptxUrl} width="100%" height="600px" />
        ) : (
          <p>正在加载 PPTX...</p>
        )}
      </div>
    );
  }
}

export default PPTXPreview;
