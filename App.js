import { useEffect, useState } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./queries";
import LENSHUB from "./lenshub";
import { ethers } from "ethers";
import { Box, Button, Image, Link } from "@chakra-ui/react";

function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  console.log('~ profiles', profiles)
  const [posts, setPosts] = useState([]);
  console.log('~ posts', posts)   

  async function signIn() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  async function getRecommendedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
    const profiles = response.data.recommendedProfiles.slice(0, 5);
    setProfiles(profiles);
  }

  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();

    const posts = response.data.explorePublications.items.filter((post) => {
      if (post.profile) return post;
      return "";
    });
    setPosts(posts);
  }
  async function colorchange(){
    const color = document.getElementById("button");
    Button.backgroundColor="red";
  }

  async function follow(id) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      return url;
    }

    return "/default-avatar.png";
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%"
      //  backgroundColor="#088079"
       >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="90%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
          
            <Box
              marginLeft="25px"
              display="flex"
              fontFamily="DM Serif Display"
              fontSize="44px"
              fontStyle= "oblique"
            >
            <Image
               marginright="800px"
               paddingTop="7px"
               alt="Logo"
               src="logo.png"
               width="50px"
               height="55px"
            />
            <Box
              marginLeft="25px"
              >
                <text>ETHVERSE</text>
            </Box>
              

            </Box>
          </Box>
          {account ? (
            <Box backgroundColor="#D3DC17" 
            marginRight="20px" borderRadius="6px" width="100px" height="40px" 
            align="center"
            padding="5px"
            >
              Connected
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="white"
              background="#D3DC17"
              _hover={{ backgroundColor: "#EED390" }} 
          >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="35px auto auto auto"
        color="white"
      >
        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              // backgroundColor="#e088f0"
              backgroundImage="v4.jpg"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post.profile)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px" color="black">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px" color="black">
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        backgroundColor="black"
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.id)}
                      />
                                {account ? (
            <Box backgroundColor="white" 
            color="black"
            paddingTop="600px"
            marginRight="20px" borderRadius="6px" width="100px" height="40px" 
            align="center"
            padding="5px"
            >
              liked
            </Box>
          ) : (
            <Button
               onClick={() => follow(post.id)}
              color="black"
              background="white"
              _hover={{ backgroundColor: "red" }}
          
          >
              Like
            </Button>

          )}
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px" color="blacks">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box
          width="70%"
          // backgroundColor="rgba(5, 32, 64, 28)"
          backgroundImage="v1.jpg"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
          marginLeft="25px"
        >
          <Box fontFamily="DM Serif Display" color="black">FRIEND SUGGESTIONS</Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                color="black"
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
              
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px"
                display="flex"
                
                >
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                  <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        align="left"
                        onClick={() => follow(posts.id)}
                      />

                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
