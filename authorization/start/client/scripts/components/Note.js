import React from 'react';

const Note = ({_id, title, description, onDelete}) => {
  const deleteNote = (e) => {
    e.preventDefault();
    fetch(`/api/notes/${_id}`, { method: 'DELETE', credentials: 'include'})
    .then(res => onDelete());
  }

  return <li>
    <strong>{ title }</strong> - { description }&nbsp;

    <a href='#' onClick={ deleteNote }>(Delete)</a>
  </li>
}

export default Note;