import React, { useCallback } from 'react';

import DropZone from './DropZone';

import { BlobReader, ZipReader, TextWriter } from '@zip.js/zip.js'


/**
 *
 * @param {*} props
 */
const OirDataFilesPicker = (props) => {
  const { handleData, text } = props;

  const onDrop = useCallback(async (acceptedFiles) => {
    const files = await Promise.all(acceptedFiles.map((file) => new Promise(async (resolve, reject) => {
      // Depending on the browser, path or name might not be set, so we use our own nameOrPath
      // eslint-disable-next-line no-param-reassign
      file.nameOrPath = file.name || file.path;

      const extension = getFileExtension(file.nameOrPath);

      if (extension === 'zip') {
        resolve({ fileInfo: file, fileData: file });
      }
      else {
        const reader = new FileReader();
        reader.onabort = () => reject(new Error('file reading was aborted'));
        reader.onerror = () => reject(new Error('file reading has failed'));
        reader.onload = () => resolve({ fileInfo: file, fileData: reader.result });
        reader.readAsText(file, 'latin1');
      }
    })));

    const { controlFiles, textFiles } = await getControlFilesAndTextFilesFromAllFiles(files);

    const [newControlFile] = controlFiles;
    const newDataFiles = textFiles;
    handleData({ newControlFile, newDataFiles })
  }, [handleData]);



  return (
    <div className="">
      <DropZone onDrop={onDrop} text={text}></DropZone>
    </div >
  );
};

function getFileExtension(fileNameOrPath) {
  return fileNameOrPath.replace(/^.*\.(.*)$/, '$1');
}

async function getControlFilesAndTextFilesFromAllFiles(allFiles) {
  const zipFiles = [];
  const controlFiles = [];
  const textFiles = [];
  allFiles.forEach((file) => {
    const extension = getFileExtension(file.fileInfo.nameOrPath);
    if (extension === 'zip') {
      zipFiles.push(file);
    }
    else if (extension === 'oir') {
      controlFiles.push(file);
    }
    else {
      textFiles.push(file);
    }
  });

  await addControlFilesAndTextFilesFromZipFiles({ zipFiles, controlFiles, textFiles });
  return { controlFiles, textFiles };

}

async function addControlFilesAndTextFilesFromZipFiles({ zipFiles, controlFiles, textFiles }) {
  await Promise.all(zipFiles.map(async (zipFile) => {
    const zipFileReader = new BlobReader(zipFile.fileData);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    await Promise.all(entries.map(async (zipEntry) => {
      const extension = getFileExtension(zipEntry.filename);
      const textWriter = new TextWriter('latin1');

      const fileData = await zipEntry.getData(textWriter);

      const newFile = { fileInfo: { nameOrPath: zipEntry.filename }, fileData };
      if (extension === 'oir') {
        controlFiles.push(newFile);
      }
      else {
        textFiles.push(newFile);
      }
    }));
    zipReader.close();
  }));
}


export default OirDataFilesPicker;
