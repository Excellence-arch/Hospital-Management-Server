const StaffModel = require("../model/staff.model")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const PatientModel = require("../model/patient.model")
const AppointmentModel = require("../model/appointment.model")
const PharmBillModel = require("../model/pharmBill.model")
const PaymentModel = require("../model/payment.model")

const registerStaff=(request,response)=>{
let staffDetails=request.body
StaffModel.findOne({email:staffDetails.email}, (err,result)=>{
  if(err){
    response.status(501).send({status:false,message: 'Internal Server Error'})
    }else{
      if(result){
        response.send({status:false,message: 'This user has been registered already'})
        }else{
          let form= new StaffModel(staffDetails)
          form.save( (err)=>{
            if(err){
              console.log(err)
              response.status(501).send({status:false, message:' Internal Server error'})
              }else{
                response.send({status:true, message:'registration succesful'})
          }
        })
      }
    }
  })
}

const login = (req, res) => {
  const details = req.body;
  let email=details.email
  let secret= process.env.JWT_SECRET
  StaffModel.findOne({email: details.email}, (err, response) => {
    if(err) {
      res.status(501).send({status: false, message: "Internal Server Error"});
    }else{
      if(!response){
        res.send({status: false, message: "Invalid Email address"});
      }else{
        bcrypt.compare(details.password,response.password, (err,same)=>{
        if(err){
          res.status(501).send({status: false, message: "Internal Server Error"});
          }else{
            if(same){
              const token=jwt.sign({email}, secret, {expiresIn:'60m'})
              res.send({message:'correct password',details:response, status:true,token})
              } else{
                res.send({status:false, message: 'Incorrect password'})
              }
            }
        })
    }}
 })
}

const authenticateStaff=(request,response)=>{
  let splitJwt= request.headers.authorization.split(' ')
  let token = splitJwt[1]
  const secret=process.env.JWT_SECRET
  jwt.verify(token,secret, (err,result)=>{
    if(err){
      response.send({status:false,message:'Internal Server error'})
    }
    else{
      StaffModel.findOne({email:result.email}, (err,staffDetails)=>{
        if(err){
      response.send({status:false,message:'Internal Server error'})
        }else{
          response.send({status:true, message:'User Authenticated',staffDetails})
        }
      })
    }
  })


}

const allstaffs=(request,response)=>{
  StaffModel.find( (err,staffs)=>{
    response.send(staffs)  
  })
}

const getDashboardInfo=(request,response)=>{
  let patsNum=0
  StaffModel.find( (err,staffArr)=>{
    PatientModel.find( (err,pats)=>{
      AppointmentModel.find((err,appointments)=>{        
        PharmBillModel.find((err, pharmBillArr)=>{
          PaymentModel.find((err, payments)=>{
            patsNum = pats.length
            appointments = appointments.length
            pharmNum = pharmBillArr.length
            response.send({status:true,staffArr,patsNum,appointments, pharmNum,payments})
            })

        })
      })
    })
})   
}
const getPatDetails=(request,response)=>{
  PatientModel.findOne({healthId:request.body.healthId}, (err,patient)=>{
    if(!err){
      console.log(patient)
      response.send({status:true,patDetails:patient})
    }else{
      response.status(501).send({status:false})      
    }
  })
}
const deleteStaff = (req, res)=>{
  console.log(req.body)
  StaffModel.findByIdAndDelete(req.body.id, (err)=>{
    if(!err){
      res.json({status: true})
    }else res.status(300).json({status: true})
  })
}
const allFinances = (req, res)=>{
  PaymentModel.find((err, finances)=>{
    if(!err){
      res.json(finances)
    }else{
      res.status(300).json('Internal Server Error');
    }
  })
}

module.exports = { login,registerStaff,allstaffs,authenticateStaff,getDashboardInfo,getPatDetails, deleteStaff, allFinances }