import React from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

//custom hook to be reused
const useSemiPersistentState = (key,initialState) => {
  const [value, setValue] = React.useState(localStorage.getItem(key)||initialState);

    //useEffect Hook to trigger side effect to lsocalstorage everytime the seach term changed, it helps opt into the react components life cycle
    //so we can show the latest searched term which is stored in the localstorage of browser API
  React.useEffect(() => {
    localStorage.setItem(key,value);
  }, [value,key]);
  
  return [value, setValue];
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };

    default:
      throw new Error();
  }
} 

const API_ENDPOINT= 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  //passsing the key to overvome overwrting allocated item in local storage,
  //provide initialState key to prevent stale key
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search','React');

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data:[],isLoading:false,isError:false }
  );

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT'});
    try{
      const result = await axios.get(url);
        dispatchStories({
          type:'STORIES_FETCH_SUCCESS',
          payload: result.data.hits,
        });
    } catch{ 
        dispatchStories({type: 'STORIES_FETCH_FAILURE'})
    };
  }, [url]);

React.useEffect(() => {
  handleFetchStories();
},[handleFetchStories])

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload:item,
    });
  };

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  const searchedStories = stories.data.filter((story) => {
      return story.title
        .toLocaleLowerCase()
        .includes(searchTerm.toLowerCase());
  });

  return (
    <div className="App">
      <h1>My hacker stories</h1>

      <InputWithLabel 
        id="search" 
        label="Search" 
        value={searchTerm} 
        isFocused
        onInputChange={handleSearchInput}> 
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="button"
        disabled = {!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>
      <hr/>
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </div>
  );
};

const InputWithLabel = ({id,children,value,isFocused,type = 'text',onInputChange}) => {

  const inputRef = React.useRef();
  React.useEffect(() => {
    if(isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  },[isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref= {inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
}

const List = ({ list , onRemoveItem}) =>
  list.map(item => (
    <Item 
      key={item.objectID}
      item={item} 
      onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => {
  return(
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick= {() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  );
};

export default App;
