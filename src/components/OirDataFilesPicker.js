import React, { useCallback } from 'react';

import DropZone from './DropZone';

const oirMatcher = /\.oir$/;

/**
 *
 * @param {*} props
 */
const OirDataFilesPicker = (props) => {
  const { handleData, encoding = 'latin1' } = props;

  const onDrop = useCallback(async (acceptedFiles) => {
    const files = await Promise.all(acceptedFiles.map((file) => new Promise((resolve, reject) => {
      // Depending on the browser, path or name might not be set
      // eslint-disable-next-line no-param-reassign
      file.nameOrPath = file.name || file.path;
      const reader = new FileReader();

      reader.onabort = () => reject(new Error('file reading was aborted'));
      reader.onerror = () => reject(new Error('file reading has failed'));

      if (encoding === 'bin') {
        reader.onload = () => resolve({ fileInfo: file, fileData: Array.from(new Uint8Array(reader.result)) });
        reader.readAsArrayBuffer(file);
      }
      else {
        reader.onload = () => resolve({ fileInfo: file, fileData: reader.result });
        reader.readAsText(file, encoding);
      }
    })));
    const [newControlFile] = files.filter((file) => oirMatcher.test(file.fileInfo.nameOrPath));
    const newDataFiles = files.filter((file) => !oirMatcher.test(file.fileInfo.nameOrPath));
    handleData({ newControlFile, newDataFiles })
  }, [handleData, encoding]);



  return (
    <div className="">
      <DropZone onDrop={onDrop}></DropZone>
    </div >
  );
};



export default OirDataFilesPicker;
