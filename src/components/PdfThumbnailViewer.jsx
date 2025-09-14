import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

const pageThumbnailPlugin = ({ PageThumbnail }) => ({
    renderViewer() {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {PageThumbnail}
            </div>
        );
    },
});

const PdfThumbnailViewer = ({ pdfUrl, width, height }) => {
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Cover } = thumbnailPluginInstance;
    const pageThumbOnly = pageThumbnailPlugin({ PageThumbnail: <Cover getPageIndex={() => 0} /> });

    const style = {
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
    };

    return (
        <div style={style}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[thumbnailPluginInstance, pageThumbOnly]} />
            </Worker>
        </div>
    );
};

export default PdfThumbnailViewer;

