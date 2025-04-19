import { Dispatch, EventHandler, SetStateAction } from "react";
import ScollContainerMeun from "./scoll_Container_Meun";
import WeatherLocationSearchBar from "./weather_Location_SearchBar";
import { GetWeatherForecast } from "../action/serveractions";
import Cookies from 'js-cookie';
import { cookies } from "next/headers";

function isNotUndefinedArray<T>(arr: T[]): arr is Exclude<T, undefined>[] {
    return arr.every(elem => elem !== undefined);
  }  
export default function TopBar({weatherinfoArray,setweatherinfoArray,setWeatherinfo}:
    {weatherinfoArray:weatherinfoFetched[],
        setweatherinfoArray:Dispatch<SetStateAction<weatherinfoFetched[]>>,
        setWeatherinfo:Dispatch<SetStateAction<weatherinfoFetched>>
    }) {
        
        
        function searchBarOnclick(e:React.MouseEvent<HTMLButtonElement>){
            let locationname=e.currentTarget.innerText
            let response={}
            fetch(process.env.NEXT_PUBLIC_BACKEND_URL as string +`/name/${locationname}`).then(
                (r)=>{
                    return r.json()
                }
            ).then((r)=>{
                if(r.status!="success"){
                    console.log("fecth fail")
                    console.log(r)
                }
                else{
                    console.log("fecth success,")
                    let longtitude=r.value.longitude
                    let latitude=r.value.latitude
                    console.log(r)
                    console.log(longtitude)
                    console.log(latitude)
                    if(latitude!=undefined&&longtitude!=undefined){
                        GetWeatherForecast(latitude,longtitude).then
                        (r=>{
                            if(weatherinfoArray.every(((value)=>(value?.daliy.location!=locationname))))
                            {
                                setweatherinfoArray([...weatherinfoArray,{...r,daliy:{...r.daliy,location:locationname}}]);
                                setWeatherinfo({...r,daliy:{...r.daliy,location:locationname}})
                                let citycookie=Cookies.get("city")
                                if(citycookie!=undefined){
                                    let oldcitycookie= JSON.parse(citycookie)
                                    let newcityCookie=[...oldcitycookie,locationname]
                                    let now=new Date()
                                    now.setFullYear(now.getFullYear()+1)
                                    Cookies.set("city",JSON.stringify(newcityCookie),now)
                                }
                                else{
                                    let now=new Date()
                                    now.setFullYear(now.getFullYear()+1)
                                    Cookies.set("city",JSON.stringify([locationname]),now)
                                }
                        }
                        })
                    }
                }
            })
        }
        function navButtonOnclick(e:React.MouseEvent<HTMLButtonElement>){
            let ptag= e.currentTarget.getElementsByTagName("p")
            console.log(ptag)
            if(ptag[0]!=undefined){
                let locationName=ptag[0].innerHTML
                let weatherinfo=weatherinfoArray.find((weatherinfo)=>{return weatherinfo?.daliy.location==locationName})
                console.log(weatherinfo)
                if(weatherinfo!=undefined){
                    setWeatherinfo({...weatherinfo});
            }
            }
        }
        var locationWeatherArray=weatherinfoArray.map((weatherinfo)=>{
            if(weatherinfo!=undefined)
            return weatherinfo.daliy
        })
        if(isNotUndefinedArray(locationWeatherArray))
        return(
            <div className="flex-col flex sm:flex-row sm:w-full sm:h-max mb-5">
                <WeatherLocationSearchBar  onClick={searchBarOnclick}/>
                <ScollContainerMeun LocationInfoList={locationWeatherArray} onClick={navButtonOnclick}/>
            </div>
        )
};
