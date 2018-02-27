import React from 'react';

const Note = ({_id, title, description, author, onDelete, user}) => {
  const deleteNote = (e) => {
    e.preventDefault();
    fetch(`/api/notes/${_id}`, { method: 'DELETE', credentials: 'include'})
    .then(res => onDelete());
  }

  return <li>
    <strong>{ title }</strong> - { description }&nbsp;

    { author == user._id ?
      <a href='#' onClick={ deleteNote }>(Delete)</a> :
      null
    }
  </li>
}

export default Note;