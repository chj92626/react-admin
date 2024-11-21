import React from 'react';
import DocViewer from '@cyntler/react-doc-viewer';

const FilePreview: React.FC = () => {
  return (
    <>
      <DocViewer
        documents={[
          {
            uri: 'https://minio.aimed.cn/xs-szhpt/base/2023-03-23/2014版NOF防治骨质疏松症临床指南解读.90f94a1bbe.pdf',
          },
        ]}
      />
    </>
  );
};

export default FilePreview;
