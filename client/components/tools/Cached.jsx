import miniSvgDataUri from 'mini-svg-data-uri'
import { render as renderSSR } from 'preact-render-to-string'
import { useEffect, useState } from 'preact/hooks'
import rendering from '../../functions/rendering.js'

//SERVER ONLY CACHE inline=true : component will be cached in a server file, the file will be read on each request and the content will be directly served to the client (with DATA Uri) [no extra request for client, can be eited on client side for realt time edits]
//se {{inline=false}} and useDataURI = false the component will be cached both server side and broswer side (se inline true è fatto bene con svg4everybody dovrebbe comunque essere cachato sia lato server che client)
//se inline=false and useDataURI = true the component will be cached only server side and the client will be served with a data uri (no extra request for client, can be eited on client side for realt time edits)
// TO DO: add local storage cache for the browser (if the file is not cached on the server, the client will fetch it and cache it in the local storage? (maybe we should use the browser cache instead of local storage? or js memory?))


function Cached(children, {id, render='fileRef', general, ...props}) { //should also be able to return file content with dangerous inner html, no data uri
  if (!id) return children  
  const fileName = general ? "general" : id //general still to be implemented (might have more pros in the client side caching) (actualy we should maybe split svgs in different files, one for each category and than direclty load them as svg assets instead of fetching?)
    const cacheDir = `./Cache/${fileName}.svg` 
    const compReference = general ? '#' + id : "#c" 

    if (globalThis.isBrowser) { //if data uri we have to return data uri....
      if (render === "inline") return children
      else  //if we are in the browser we return the path to the server chached file (the browser will cache it as well)
      return pathsError ? children : <use href={(render === "dataURI" && cachedPaths ? miniSvgDataUri(cachedPaths) : cacheDir) + compReference} {...props}/>
        const [cachedPaths,setCachedPaths] = useState()
        const [pathsError,setPathsError] = useState()
        // fetch the cached SVG file from the server
        useEffect(async () => {
            try {
                const response = await fetch(cacheDir)
                if (!response.ok) {
                    console.log("Failed to fetch cached SVG file, rendering the component instead")
                }
                const cached = await response.text()
                // render the cached SVG file
                setCachedPaths(cached)
            } catch {
                setPathsError(true)
            }
        
        }, [])
            //return cachedPaths ? extractPathsFromCache(cachedPaths) : null
       
                
    } else {
        try {//component already cached?
           Deno.statSync(cacheDir) //will throw an error faster than readTextFileSync
           const cachedVersion = Deno.readTextFileSync(cacheDir)

            //if inline svg is needed we extract the paths of the cached file
            if (render === "inline") 
                return extractPathsFromCache(cachedVersion)
            else
                //if data uri is needed we return the data uri of the cached file otherwise we return the cached file
                return <use href={(render === "dataURI" ? miniSvgDataUri(cachedVersion) : cacheDir) + compReference} {...props}/>

        } catch { 
        //component is not present in the server

        //we have to render the component and save it to the server
        const render = rendering(children,general ? id: "c")

        //write file in async way to not block the request 
        Deno.writeTextFile(cacheDir, render, {create: true})

        //for now we will serve the component itself or the data uri if requested
        return render === "dataURI" ? <use href={miniSvgDataUri(render)+compReference} {...props}/> : extractPathsFromCache(render)
        }
    }
}

function Static({ children }) {
  return <g dangerouslySetInnerHTML={{}}>{children}</g>;
}
function extractPathsFromCache(html) {
  // use regex to match all path elements in the html
  const regex = /<path[^>]*>/g;
  const pathElements = [...html.matchAll(regex)];
  return pathElements.map((element, i) => {
    const properties = extractProperties(element);
    return <path {...properties} />;
  });
}
function extractProperties(element) {
  const properties = {};
  const elementString = element[0];
  const match = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;
  let prop;
  while ((prop = match.exec(elementString))) {
    properties[prop[1]] = prop[2];
  }
  return properties;
}


// regular expression to match suffix after the #

function readCachedVersion(cacheDir) {
    const cacheDirRegex = /(.*)#(.*)/; 
  const match = cacheDir.match(cacheDirRegex);
  const id = match && match[2];

  const cachedHtml = Deno.readTextFileSync(match[1] || cacheDir);

  // Parse the cached HTML into a document object
  const parser = new DOMParser();
  const doc = parser.parseFromString(cachedHtml, 'image/svg+xml');

  // Get the SVG element with the corresponding ID
  const svgElement = doc.getElementById(id);

  if (svgElement) {
    // Serialize the SVG element back to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  }

  // If the ID is not found, return an empty string
  return '';
}


export {Static}
export default Cached



    //delete Component.props.children?.__v //delete version props for hashing
    //const id = objectHash(Component.props) //unique id of these props (component name may be needed)


//forse sarebbe utile fare una funzione fileFetch isomorphic che lato server va a cercare nel file system e lato client va a cercare nel server -> browser cache?

