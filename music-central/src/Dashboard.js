import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import Player from './Player';
import TrackSearchResult from './TrackSearchResult';
import { Container, Form } from 'react-bootstrap';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

const spotifyApi = new SpotifyWebApi({
    clientId: "463a487aeff54f48bc6a88eea08f220e",
});

const LOGOUT_URL = "https://accounts.spotify.com/logout"

export default function Dashboard({ code }) {
    const accessToken = useAuth(code)
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [playingTrack, setPlayingTrack] = useState();
    const [lyrics, setLyrics] = useState("");

    function chooseTrack(track) {
        setPlayingTrack(track);     // choose passed track
        setSearch("");              // reset search
        setLyrics("");              // reset lyrics
    }

    // if playingTrack is modified, initiate a GET request for lyrics of new track 
    useEffect(() => {
        if (!playingTrack) return;
        axios
            .get("http://localhost:3001/lyrics", {
                params: {
                    track: playingTrack.title,
                    artist: playingTrack.artist
                },
            })
            .then(res => {
                console.log(res.data.lyrics)
                setLyrics(res.data.lyrics)
            })
            .catch(err => {
                console.error(err);
            })
    }, [playingTrack])

    // if {accessToken} changes, handle it
    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken]);

    // if either {search} or {accessToken} are modified, ...
    useEffect(() => {
        if (!search) return setSearchResults([]);   // if nothing in search, reset search results to empty array
        if (!accessToken) return                    // no access, no search

        let cancel = false;
        spotifyApi.searchTracks(search)
        .then(res => {
            if (cancel) return 
            setSearchResults(
                res.body.tracks.items.map(track => {
                    const smallestAlbumImage = track.album.images.reduce(
                        (smallest, image) => {
                            if (image.height < smallest.height) return image;
                            return smallest;
                        },
                        track.album.images[0]
                    )

                    // const biggestAlbumImage = track.album.images.reduce(
                    //     (biggest, image) => {
                    //         if (image.height < biggest.height) return image;
                    //         return biggest;
                    //     },
                    //     track.
                    // )

                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        albumUrl: smallestAlbumImage.url,
                        // bigAlbumUrl: biggestAlbumImage.url,
                    }
                })
            )
        })

        return () => (cancel = true)
    }, [search, accessToken])


    function handleLogout() {
        window.location = {LOGOUT_URL};
        // window.location = "http://localhost:3000";
    }

    const header = (track) => {
        let head;
        if (track) {
            head = (
                <div>
                    <strong>{playingTrack.title}</strong>
                    {playingTrack.artist}
                    <br/>
                </div>
            )
        }
    }

    return (
        <Container className="d-flex flex-column py-2 bg-dark" style={{ height: "100vh" }}>
            {/* top div/area for search bar */}
            <div id="topBar">
                <div>
                    <a className="btn btn-warning btn-sm" onClick={handleLogout}>
                        Logout
                    </a>
                </div>
                <Form.Control
                    type="search"
                    placeholder="Search Songs/Artists"
                    // value="search"
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            
            {/* middle div for lyrics */}
            <div className="flex-grow-1 my-2" style={{ overflowY: "auto", width: "100%" }}>
                {searchResults.map(track => (
                    <TrackSearchResult
                        track={track}
                        key={track.uri}
                        chooseTrack={chooseTrack}
                    />
                ))}
                {searchResults.length === 0 && playingTrack && (
                    <div>
                        <div className="text-center text-white" style={{ whiteSpace: "pre" }}> 
                        {/* , width: "50%", float: "left" }}> */}
                            <br />
                            <div className="d-flex align-items-center justify-content-center">
                                <img src={playingTrack.albumUrl} alt={playingTrack.alt} style={{ height: "150px", width: "150px", borderRadius: "50%" }} />
                            </div>
                            <br/>
                            <strong>{playingTrack.title}</strong>
                            <br />
                            {playingTrack.artist}
                            <hr />
                            {lyrics}
                        </div>
                        {/* <div style={{ width: "50%", float: "right" }}>
                            <div className="d-flex align-items-center justify-content-center">
                                <img src={playingTrack.albumUrl} alt={playingTrack.alt} style={{ height: "200px", width: "200px", borderRadius: "50%" }} />
                            </div>
                        </div> */}
                    </div>
                )}
            </div>
                
            {/* bottom div for player */}
            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
            </div>
        </Container>
    );
}
