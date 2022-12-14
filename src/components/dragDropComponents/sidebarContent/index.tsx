import React from 'react';
import s from "./SidebarContent.module.scss"

interface Props {
    items: any
}

const SidebarContent = ({items}: Props) => {

    return (
        <div className={s.root}>
            <div>
                <span>{items.items.icon}</span>
                <p className={s.title}>{items.items.title}</p>
            </div>
        </div>
    );
};

export default SidebarContent;