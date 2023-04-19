import { useRef, useState, useEffect } from "react";

import "../scss/MedicalHistory.scss";
import { FormattedMessage } from "react-intl";

import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import EditProfileModal from "./EditProfileModal"
import * as actions from "../../../store/actions";
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from "../../../utils";

import { Modal } from "reactstrap";
import moment from "moment";
import {
  cancelBooking,
} from "../../../services/userService";

import {
  filterHistoriesPatient,
  getListBookedAppoinment
} from "../../../services/userService";

import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";


export default function BookedAppointment() {
    const [previewImgURL, setPreviewImgURL] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [units, setUnits] = useState([
      {key: "pill", valueVi:"Viên", valueEn:"Pill"},
      {key: "package", valueVi:"Gói", valueEn:"Package"},
      {key: "bottle", valueVi:"Chai", valueEn:"Bottle"},
      {key: "tube", valueVi:"Ống", valueEn:"Tube"},
      {key: "set", valueVi:"Bộ", valueEn:"Set"},
    ]);
    const [isShowLoading, setIsShowLoading] = useState(false);
    const [listAppointment, setListAppointment] = useState([]);
    
    

    const dispatch = useDispatch();
    let history = useHistory();

    const { isLoggedIn, userInfo, language } = useSelector((state) => ({
      isLoggedIn: state.user.isLoggedIn,
      userInfo: state.user.userInfo,
      language: state.app.language,
    }));

    console.log("userInfo",userInfo)


const handleGetListBookedAppoinment = async () => {
    let response = await getListBookedAppoinment(userInfo.id);
    setListAppointment(response.data)
}

const convertStatusToText = (statusId) => {
    let result;
    switch (statusId) {
        case 'S1': result = language === "en" ? 'Waiting for confirm' : 'Đang chờ xác nhận'; break;
        case 'S2': result = language === "en" ? 'Confirmed' : 'Bác sĩ đã xác nhận lịch hẹn'; break;
        case 'S3': result = language === "en" ? 'Done' : 'Hoàn thành khám'; break;
        case 'S4': result = language === "en" ? 'Canceled' : 'Đã huỷ'; break;
        default: result =  '';
    }

    return result;
}

const convertTimeTypeToText = (timeType) => {
    let result;
    switch (timeType) {
        case 'T1': result =  '8:00 AM - 9:00 AM'; break;
        case 'T2': result =  '9:00 AM - 10:00 AM'; break;
        case 'T3': result =  '10:00 AM - 11:00 AM'; break;
        case 'T4': result =  '11:00 AM - 0:00 PM'; break;
        case 'T5': result =  '1:00 PM - 2:00 PM'; break;
        case 'T6': result =  '2:00 PM - 3:00 PM'; break;
        case 'T7': result =  '3:00 PM - 4:00 PM'; break;
        case 'T8': result =  '4:00 PM - 5:00 PM'; break;
        default: result =  '';
    }

    return result;
}

const handleBtnCancel = async (item) => {
  setIsShowLoading(true)
  let res = await cancelBooking({
    id: item.id,
    doctorId: item.doctorId,
    patientId: item.patientId,
    timeType: item.timeType,
    date: item.date,
    statusId: item.statusId,
  });
  if (res && res.errCode === 0) {
    setIsShowLoading(false)
    if(language==="en"){
      toast.success("cancel appointment succeed!");
    }else{
      toast.success("Hủy cuộc hẹn thành công!");
    }
    handleGetListBookedAppoinment()
  } else {
    setIsShowLoading(true)
    if(language==="en"){
      toast.error("Something wrongs...!");
    }else{
      toast.error("Lỗi!");
    }
  }
};

useEffect(()=> {
    if(userInfo){
        handleGetListBookedAppoinment()
    }
}, [userInfo])
  return (
    <LoadingOverlay
    active={isShowLoading}
    spinner={<ClimbingBoxLoader color={"#86e7d4"} size={15} />}
  >
        <div>
            <div class="d-flex justify-content-center">
              <h2><FormattedMessage id="medical-history.booking-history" /></h2>
            </div>
            <div class="row">
                <div class="col-12">
                    <table class="table table-hover mt-45">
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col"><FormattedMessage id="medical-history.date-examination" /></th>
                          <th scope="col"  class="text-center"><FormattedMessage id="medical-history.doctor" /></th>
                          <th scope="col" class="text-center"><FormattedMessage id="medical-history.status" /></th>
                          <th scope="col" class="text-center">&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          listAppointment && listAppointment.map((item,index)=>{
                            return(
                              <tr>
                                  <th scope="row">{index+1}</th>
                                  <td>{`${moment(parseInt(item.date)).format("DD/MM/YYYY")} ${convertTimeTypeToText(item.timeType)}`}</td>
                                  <td class="text-center">
                                      <div class="pointer text-primary" onClick={()=>history.push(`/detail-doctor/${item.doctorId}`)}>{item.doctorDataBooking?.lastName} {item.doctorDataBooking?.firstName}</div>
                                  </td>
                                  <td class="text-center">{convertStatusToText(item.statusId)}</td>
                                  <td>
                                    {item.statusId === 'S1' && <button
                                      className="btn btn-danger mx-5"
                                      onClick={() => handleBtnCancel(item)}
                                    >
                                      <FormattedMessage id={"manage-patient.cancel"} />
                                    </button>}
                                  </td>
                              </tr>
                            )
                          })
                        }
                      
                      </tbody>
                    </table>
                </div>
            </div>

            {isOpen === true && (
            <Lightbox
              mainSrc={previewImgURL}
              onCloseRequest={() => setIsOpen(false)}
            />
          )}
        </div>
    </LoadingOverlay>
  );
}
