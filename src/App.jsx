import * as React from "react";
import {useState} from "react";

/* eslint-disable */

const App = () => {
  const initialStories = [
      {
          title: 'React',
          url: 'https://reactjs.org/',
          author: 'Jordan Walke',
          num_comments: 3,
          points: 4,
          objectID: 0,
      },
      {
          title: 'Redux',
          url: 'http://redux.js.org/',
          author: 'Dan Abramov, Andrew Clark',
          num_comments: 2,
          points: 5,
          objectID: 1
      }
  ];

  const getAsyncData = () => (
    new Promise((resolve) =>
      setTimeout(() =>
        resolve({
          data: {
            stories: initialStories,
          },
        })
      )
    )
  );

  const storyReducerActionTypes = {
    STORIES_FETCH_INIT: 'STORIES_FETCH_INIT',
    STORIES_FETCH_SUCCESS: 'STORIES_FETCH_SUCCESS',
    STORIES_FETCH_FAILURE: 'STORIES_FETCH_FAILURE',
    REMOVE_STORY:'REMOVE_STORY',
  }

  const storiesReducer = (state, action) => {
    switch (action.type) {
      case storyReducerActionTypes.STORIES_FETCH_INIT:
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case storyReducerActionTypes.STORIES_FETCH_SUCCESS:
        return {
          ...state,
          data: action.payload,
          isLoading: false,
          isError: false,
        };
      case storyReducerActionTypes.STORIES_FETCH_FAILURE:
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      case storyReducerActionTypes.REMOVE_STORY:
        return {
          ...state,
          data: state.data.filter(story => story.objectID !== action.payload),
        };
    }
  }

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    {data: [], isLoading: false, isError: false}
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    dispatchStories({type: storyReducerActionTypes.STORIES_FETCH_INIT});
    getAsyncData()
      .then(result => {
        dispatchStories({
          type: storyReducerActionTypes.STORIES_FETCH_SUCCESS,
          payload: result.data.stories,
        });
        setIsLoading(false);
      })
      .catch(() => dispatchStories({type: storyReducerActionTypes.STORIES_FETCH_FAILURE}));
  }, []);

  const removeStoryFromList = (storyId) => {
    dispatchStories({
      type: storyReducerActionTypes.REMOVE_STORY,
      payload: storyId,
    });
  };

  const useStorageState = (key, initialState) => {
    const [value, setValue] = useState(
      localStorage.getItem(key) ?? ''
    );

    React.useEffect(() => {
      localStorage.setItem(key, value);
    }, [key, value]);

    return [value, setValue];
  };

  const [searchTerm, setSearchTerm] = useStorageState('search', '');

  React.useEffect(() => {
    localStorage.setItem('search', searchTerm);
  }, [searchTerm])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.data.filter(story => {
    return story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });


  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel id="search"
                      value={searchTerm}
                      onInputChange={handleSearch}
                      isFocused>
        <strong>Search:</strong>
      </InputWithLabel>

      <hr/>

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? <p>Loading...</p> :
        <List list={searchedStories} removeStory={removeStoryFromList} />
      }
    </div>
  );
}

const InputWithLabel = ({id, type = 'text', value, onInputChange, isFocused, children}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input id={id}
           type={type}
           value={value}
           autoFocus={isFocused}
           onChange={onInputChange} />
  </>
)

const List = (props) => (
  <ul>
      {props.list.map(item => (
          <Item key={item.objectID} item={item} removeStory={props.removeStory} />
      ))}
  </ul>
);

const Item = ({item, removeStory}) => (
  <li>
    <span>
        <a href={item.url}>{item.title}</a>
    </span>
    &nbsp;
    <span>{item.author}</span>
    &nbsp;
    <span>{item.num_comments}</span>
    &nbsp;
    <span>{item.points}</span>
    &nbsp;
    <button onClick={() => removeStory(item.objectID)}>Remove</button>
  </li>
);

export default App
