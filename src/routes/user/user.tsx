import React, { useState, useEffect, useMemo, Fragment, useRef } from "react";
import _ from "lodash";
import { useSearchParams, useNavigate, NavLink } from "react-router-dom";
import { getQuery, patchQueryFormData, putQueryFormData } from "../../api/service";
import useLocalStorage from '../../helpers/useLocalStorage';
import rights from "../../helpers/rights";
import UploadButton from "../../components/uploadButton";
import {Checkbox} from "../../components";
import "./user.scss";

interface iUser 
{
  id: string;
  active?: boolean;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  description?: string;
  login?: string;
  email?: string;
  fio?: string;
  oldPassword?: string;
  newPassword?: string;
  token?: string;
  photo?: string;
  rights?: string[];
}

export default function User() {
  const navigate = useNavigate();
  const [user, setUser, deleteUser] = useLocalStorage('user', {
    id: '',
    login: '',
    email: '',
    photo: '',
    token: ''
  });

  const [searchParams] = useSearchParams();
  const userId = parseInt(searchParams.get('userId'), 10);

  const [curUser, setCurUser] = useState<iUser>();
  const [newUser, setNewUser] = useState<iUser>();
  const [newPhoto, setNewPhoto] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }
    const getUsers = () => {
      getQuery("/users/read",  user.token, {id: userId}).then((data:any)=>{
        if (!_.isUndefined(data)) {
          setCurUser(data);
          setNewUser(data);
        }
      });
    }
    getUsers();
  }, [userId]);

  const photoSrc = useMemo(() => _.isEmpty(newPhoto) ? `../${curUser?.photo}` : newPhoto, [newPhoto, curUser?.photo])

  const doSave = ()=> {
    if (!userId) {
      putQueryFormData("/users/create", user.token, newUser).then((data:any)=>{
        if (!_.isUndefined(data)) {
          navigate(`/user?userId=${data.id}`);
        }
      }).catch((err)=>{
        setErrMsg(err)
      });
      return
    }

    patchQueryFormData("/users/update", user.token, newUser).then((data:any)=>{
      if (!_.isUndefined(data)) {
        setCurUser(data);
        setNewUser(data);
        setNewPhoto("");
        setErrMsg("");
      }
      if (user.id === curUser.id) {
        setUser(data);
      }
    }).catch((err)=>{
      setErrMsg(err)
    });

  }

  const checkboxAdmin = (isChecked) => {
    setNewUser((prev)=>({...prev, rights: isChecked ? _.uniq([...newUser?.rights, "1"]) : _.filter(newUser?.rights, (i)=>(i!=="1"))}))
  }

  const checkboxGuest = (isChecked) => {
    setNewUser((prev)=>({...prev, rights: isChecked ? _.uniq([...newUser?.rights, "2"]) : _.filter(newUser?.rights, (i)=>(i!=="2"))}))
  }

  const checkboxActive = (isChecked) => {
    setNewUser((prev)=>({...prev, active: isChecked}))
  }

  const onSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div id="user">
      <NavLink to="/users">????????????????????????</NavLink>
      <h4>???????????????????????????? ????????????????????????:</h4>
      <form action="#" onSubmit={onSubmit}>
        <div className="row user-form">
          <div className="col-2">
            <span className="image fit">
              {photoSrc === "../" ? <span className="icon-user-circle user-photo"/> : <img src={photoSrc} alt=""/>}
            </span>
          </div>
          <div className="col-10">
            <div className="row user-form">
              <div className="col-5">
                <label>??????: {curUser?.fio}</label>
              </div>
              <div className="col-5">
                <label>??????????????????????????: {curUser?.id}</label>
              </div>
            </div>
            <div className="row user-form">
              { user.id === curUser?.id && <div className="col-5"><label htmlFor="user-oldPassword">?????????????? ????????????:</label> <input
                  type="password" name="user-oldPassword" value={newUser?.oldPassword ? newUser.oldPassword : ""} placeholder="?????????????? ????????????"
                  onChange={({target: {value}})=>setNewUser((prev)=>({...prev, oldPassword: value}))}
                /></div>
              }
              <div className="col-5">
                <label htmlFor="user-newPassword">?????????? ????????????:</label>
                <input type="password" name="user-newPassword" value={newUser?.newPassword ? newUser.newPassword : ""} placeholder="?????????? ????????????"
                  onChange={({target: {value}})=>setNewUser((prev)=>({...prev, newPassword: value}))}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row user-form">
          <div className="col-12">
            <UploadButton icon="icon-insert_photo" name="photo" getFiles={(files)=>{
              setNewUser((prev)=>({...prev, photo: _.first(files)}))
            }} getSrc={(imgs)=>{
              setNewPhoto(_.first(imgs))
            }}>???????????????? ????????</UploadButton>
          </div>
        </div>
        <div className="row user-form">
          <div className="col-6">
            <label htmlFor="user-login">??????????:</label>
            <input type="text" name="user-login" value={newUser?.login ? newUser.login : ""} placeholder="??????????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, login: value}))}
            />
          </div>
          <div className="col-6">
            <label htmlFor="user-email">?????????? ?????????????????????? ??????????:</label>
            <input type="text" name="user-email" value={newUser?.email ? newUser.email : ""} placeholder="?????????? ?????????????????????? ??????????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, email: value}))}
            />
          </div>
        </div>
        <div className="row user-form">
          <div className="col-4">
            <label htmlFor="user-firstname">??????:</label>
            <input type="text" name="user-firstname" value={newUser?.firstname ? newUser.firstname : ""} placeholder="??????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, firstname: value}))}
            />
          </div>
          <div className="col-4">
            <label htmlFor="user-lastname">??????????????:</label>
            <input type="text" name="user-lastname" value={newUser?.lastname ? newUser.lastname : ""} placeholder="??????????????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, lastname: value}))}
            />
          </div>
          <div className="col-4">
            <label htmlFor="user-middlename">????????????????:</label>
            <input type="text" name="user-middlename" value={newUser?.middlename ? newUser.middlename : ""} placeholder="????????????????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, middlename: value}))}
            />
          </div>
        </div>
        <div className="row user-form">
          <div className="col-12">
            <label htmlFor="user-description">????????????????:</label>
            <textarea name="user-description" value={newUser?.description ? newUser.description : ""} placeholder="????????????????"
              onChange={({target: {value}})=>setNewUser((prev)=>({...prev, description: value}))}
            />
          </div>
        </div>
        <div className="row user-form">
          <div className="col-3">
            <Checkbox name="user-admin" checked={_.includes(newUser?.rights ? newUser.rights : [], "1")} onChange={checkboxAdmin}>
              {rights["1"]}
            </Checkbox>
          </div>
          <div className="col-3">
            <Checkbox name="user-guest" checked={_.includes(newUser?.rights ? newUser.rights : [], "2")} onChange={checkboxGuest}>
              {rights["2"]}
            </Checkbox>
          </div>
        </div>
        <div className="row user-form">
          <div className="col-3">
            <Checkbox name="user-guest" checked={newUser?.active ? newUser.active : false} onChange={checkboxActive}>
              ????????????????
            </Checkbox>
          </div>
        </div>
        {!_.isEmpty(errMsg) && <div className="row user-form"><div className="col-12">
          <span className="label-info">{errMsg}</span>
          </div></div>}
      </form>
      <div className="row user-form">
        <div className="col-12">
          <button className="button primary icon-save" onClick={doSave}>??????????????????</button>
        </div>
      </div>
    </div>
  );
}
