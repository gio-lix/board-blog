import React, {useEffect, useState} from 'react';
import {setFavoritesLists} from "../../redux/slices/favoriteSlice";
import {RootState, useAppDispatch, useAppSelector} from "../../redux/store";
import boardApi from "../../api/boardApi";
import DragDrop from "../drop/DragDrop";
import SidebarContent from "../dragDropComponents/sidebarContent";
import {useNavigate} from "react-router-dom";

const Favorites = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [activeIndex, setActiveIndex] = useState<any>()
    const {value: favorites} = useAppSelector((state: RootState) => state.favorites)



    useEffect(() => {
        setActiveIndex(favorites)
    },[favorites])


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (activeIndex && mounted) {
                    await boardApi.getFavoritePosition({boards: activeIndex})
                }
            } catch (err) {
                console.log(err)
            }
        })()
        return () => {mounted = false}
    },[activeIndex])




    useEffect(() => {
        let mounted = true;
        (async function getFavorites() {
            try {
                const {data} = await boardApi.getFavorite()
                if (mounted)  {
                    dispatch(setFavoritesLists(data))
                    setActiveIndex(data)
                }
            } catch (err) {
                console.log(err)
            }
        })();
        return () => {mounted = false}
    },[dispatch])

    const onNavigateLink = (id: string) => {
        navigate(`/boards/${id}`)
    }

    return (
        <DragDrop
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            onNavigate={onNavigateLink}
            Component={(item: any) => <SidebarContent items={item} />}
        />
    );
};

export default Favorites;