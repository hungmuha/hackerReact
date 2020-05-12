import React from 'react';
import logo from './logo.svg';
import './App.css';

const App = () => {
  const stories = [
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
    const [value, setValue] = React.useState(
      localStorage.getItem(key)||initialState);

      //useEffect Hook to trigger side effect to localstorage everytime the seach term changed, it helps opt into the react components life cycle
      //so we can show the latest searched term which is stored in the localstorage of browser API
    React.useEffect(() => {
      localStorage.setItem(key,value);
    }, [value,key]);
    
    return [value, setValue];
  }
  
  //passsing the key to overvome overwrting allocated item in local storage,
  //provide initialState key to prevent stale key
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search','React');

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) => {
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
      <List list={searchedStories}/>
    </div>
  );
};

const InputWithLabel = ({id,children,value,isFocused,type = 'text',onInputChange}) => (
  <>
    <label htmlFor={id}>{children}</label>
    &nbsp;
    <input
      id={id}
      type={type}
      value={value}
      onChange={onInputChange}
      autoFocus = {isFocused}
    />
  </>
 );

const List = ({ list }) =>
  list.map(item => <Item key={item.objectID} item={item} />);

const Item = ({ item }) => (
  <div>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
  </div>
);

export default App;
