import React, {lazy, Suspense, useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import boardApi from "../../api/boardApi";
import {BoardState, SectionsSate} from "../../typeing";
import s from "./Board.module.scss"
import {RootState, useAppDispatch, useAppSelector} from "../../redux/store";
import {setBoards} from "../../redux/slices/boardSlice";
import {AiFillStar, AiOutlineStar, AiFillDelete} from "react-icons/ai"
import {setFavoritesLists} from "../../redux/slices/favoriteSlice";
import Sections from "../sections";
import axiosClient from "../../api/axios";

const EmojiPicker = lazy(() => import("../emojiPicker"))


const Board = () => {
    const {value} = useAppSelector((state: RootState) => state.board)
    const {value: favorites} = useAppSelector((state: RootState) => state.favorites)
    const [board, setBoard] = useState<BoardState>()
    const [section, setSection] = useState<SectionsSate[]>([])
    const [icon, setIcon] = useState<string>("")
    const [count, setCount] = useState<number>(0)
    const {boardId} = useParams()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()



    useEffect(() => {
        let mounted = true;
        (async function getBoard() {
            try {
                if (boardId) {
                    const {data} = await boardApi.getOne(boardId)
                    if (mounted) {
                        setBoard(data)
                        setIcon(data?.icon)
                        setSection(data.sections)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        })();
        return () => {
            mounted = false
        }
    }, [boardId, count])

    const onUpdateChangeIcon = async (item: string) => {
        const _temp: BoardState[] = [...value]
        const index = _temp.findIndex((e: BoardState) => e.id === boardId)
        _temp[index] = {..._temp[index], icon: item}
        dispatch(setBoards(_temp))
        setIcon(item)

        if (favorites) {
            const _tempFavorites: BoardState[] = [...favorites]
            const favoritesIndex = _tempFavorites.findIndex((e: BoardState) => e.id === boardId)
            _tempFavorites[favoritesIndex] = {..._tempFavorites[favoritesIndex], icon: item}
            dispatch(setFavoritesLists(_tempFavorites))
        }

        try {
            await boardApi.updatePosition(boardId, {icon: item})
        } catch (err) {
            console.log(err)
        }
    }

    const onUpdateTitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setBoard({...board, title: newTitle} as BoardState)
        const _temp: BoardState[] = [...value]
        const index = _temp.findIndex((e: BoardState) => e.id === boardId)
        _temp[index] = {..._temp[index], title: newTitle}
        dispatch(setBoards(_temp))
        if (favorites) {
            const _tempFavorites: BoardState[] = [...favorites]
            const favoritesIndex = _tempFavorites.findIndex((e: BoardState) => e.id === boardId)
            _tempFavorites[favoritesIndex] = {..._tempFavorites[favoritesIndex], title: newTitle}
            dispatch(setFavoritesLists(_tempFavorites))
        }

        try {
            await boardApi.updatePosition(boardId, {title: newTitle})
        } catch (err) {
            console.log(err)
        }
    }

    const onUpdateDescription = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newDesc = e.target.value
        setBoard({...board, description: newDesc} as BoardState)

        const _temp: BoardState[] = [...value]
        const index = _temp.findIndex((e: BoardState) => e.id === boardId)
        _temp[index] = {..._temp[index], description: newDesc}
        dispatch(setBoards(_temp))

        if (favorites) {
            const _tempFavorites: BoardState[] = [...favorites]
            const favoritesIndex = _tempFavorites.findIndex((e: BoardState) => e.id === boardId)
            _tempFavorites[favoritesIndex] = {..._tempFavorites[favoritesIndex], description: newDesc}
            dispatch(setFavoritesLists(_tempFavorites))
        }

        try {
            await boardApi.updatePosition(boardId, {description: newDesc})
        } catch (err) {
            console.log(err)
        }
    }

    const onAddFavorite = async () => {
        try {
            const {data} = await boardApi.updatePosition(boardId, {favorite: !board?.favorite})
            let _newFavorites: BoardState[] = [...favorites]
            if (favorites) {
                if (!data.favorite) {
                    _newFavorites.push(data)
                } else {
                    _newFavorites = _newFavorites.filter((e: BoardState) => e.id !== boardId)
                }
            } else {
                _newFavorites.unshift(data)
            }
            dispatch(setFavoritesLists(_newFavorites))
            setBoard({...board, favorite: !board?.favorite} as BoardState)
        } catch (err) {
            console.log(err)
        }
    }

    const onDeleteBoard = async () => {
        try {
            await boardApi.deleteBoard(boardId)
            if (favorites) {
                const newFavoriteList = favorites?.filter((e: BoardState) => e.id !== boardId)
                dispatch(setFavoritesLists(newFavoriteList))
            }
            const newList = value?.filter((e: BoardState) => e?.id !== boardId)
            if (newList.length === 0) {
                navigate("/")
            } else {
                navigate(`/boards/${(newList[0] as BoardState).id}`)
            }
            dispatch(setBoards(newList))
        } catch (err) {
            console.log(err)
        }
    }

    const onAddSection = async () => {
        try {
            await axiosClient.post(`/boards/${boardId}/sections`)
            setCount(prev => prev + 1)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <section className={s.root}>
            <span className={s.star} onClick={onAddFavorite}>
                {board?.favorite ? <AiFillStar fill="yellow"/> : <AiOutlineStar/>}
            </span>
            <span onClick={onDeleteBoard} className={s.del}>
                <AiFillDelete/>
            </span>
            <div className={s.box}>
                <div className={s.emojiPicker}>
                    <Suspense fallback={`...`}>
                        <EmojiPicker
                            icon={icon && icon}
                            onChangeIcon={onUpdateChangeIcon}
                        />
                    </Suspense>
                </div>
                <input
                    type="text"
                    value={board?.title || ""}
                    onChange={onUpdateTitle}
                    className={s.title}
                    placeholder="Title"
                />
                <textarea
                    className={s.desc}
                    value={board?.description || ""}
                    onChange={onUpdateDescription}
                />
            </div>
            <div>
                <button onClick={onAddSection}>
                    Add Section
                </button>
                <p>
                    <span>{board?.sections.length}</span>
                    Section
                </p>
            </div>
            <hr/>

            {/* section board */}
            <Sections
                sectionData={section}
                setSectionData={setSection}
                boardId={boardId!}
                setCount={setCount}
            />
        </section>
    );
};

export default Board;