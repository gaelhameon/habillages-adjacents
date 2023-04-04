import React, { useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  marginBottom: '10px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = { borderColor: '#2196f3' };

const acceptStyle = { borderColor: '#00e676' };

const rejectStyle = { borderColor: '#ff1744' };

const DropZone = (props) => {
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({ ...props });
  const {
    text = `Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers`
  } = props;
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [
    isDragActive,
    isDragReject,
    isDragAccept,
  ]);

  return (
    <div data-cy="drop-zone" {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {
        isDragActive
          ? <p>Déposez les fichiers ici ...</p>
          : <p>{text}</p>
      }
    </div>
  );
};

export default DropZone;
