import React from 'react';
import logo from './logo.svg';
import './App.css';

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
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];
//custom hook to be reused
const useSemiPersistentState = (key,initialState) => {
  const [value, setValue] = React.useState(localStorage.getItem(key)||initialState);

    //useEffect Hook to trigger side effect to localstorage everytime the seach term changed, it helps opt into the react components life cycle
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

const getAsyncStories = () =>
  new Promise((resolve,reject) =>
    setTimeout(
      // () => resolve({ data: { stories: initialStories } }),
      reject,
      2000
    )
  );

const App = () => {
  //passsing the key to overvome overwrting allocated item in local storage,
  //provide initialState key to prevent stale key
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search','React');

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data:[],isLoading:false,isError:false }
  );

  React.useEffect(() => {

    dispatchStories({ type: 'STORIES_FETCH_INIT'});
    getAsyncStories()
      .then(result => {
        dispatchStories({
          type:'STORIES_SET_STORIES',
          payload: result.data.stories,
        });
      })
      .catch(() => 
        dispatchStories({type: 'STORIES_FETCH_FAILURE'})
      );
  }, []);

  const handleRemoveStory = item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload:item,
    });
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  }

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
        onInputChange={handleSearch}> 
        <strong>Search:</strong>
      </InputWithLabel>

      <hr/>
      {stories.isError && <p>Something went wrong ...</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={searchedStories}
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
