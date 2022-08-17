import React, { useEffect, useState} from 'react';
import {RootState, useAppDispatch, useAppSelector} from "../../redux/store";
import {useNavigate, useParams} from "react-router-dom";
import boardApi from "../../api/boardApi";
import {setBoards} from "../../redux/slices/boardSlice";
import {BoardState} from "../../typeing";
import DragDrop from "../drop";



const AddPrivate = () => {
    const [activeIndex, setActiveIndex] = useState<any>()
    const {value: boards} = useAppSelector((state: RootState) => state.board)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const {boardId} = useParams()


    useEffect(() => {
        let mounted = true;
        (async function getBoards() {
            try {
                const {data} = await boardApi.getAll()
                if (mounted) {
                    dispatch(setBoards(data))
                }
            } catch (err) {
                console.log(err)
            }
        })();
        return () => {
            mounted = false
        }
    }, [dispatch])


    useEffect(() => {
        const activeIndex = boards.findIndex((e: BoardState) => e.id === boardId)

        if (boards.length > 0 && boardId === undefined) {
            navigate(`/boards/${(boards[0] as BoardState).id}`)
        }


        setActiveIndex(activeIndex)
        setActiveIndex(boards)
    }, [boards])


    return (
        <>
            <DragDrop
                data={activeIndex}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
            />
        </>
    );
};

export default AddPrivate;