import { useForm } from "react-hook-form";
import '../../styles/auth.css';
import * as appService from '../../services/services';
import { useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Cookies from 'universal-cookie';

export const Register = () => {
  const [loading, setLoading] = useState(false);
  
  const {
      register,
      handleSubmit,
      watch,
      formState: { errors }
    } = useForm({
      defaultValues: {
        display_name: '',
        password: '',
        username: ''
      }
      });  

  const registerValidation = async(data:any) => {
    setLoading(true);

    await appService.postRegister(data).then((res:Response) => {
        if(res['ok']) {
          const cookies = new Cookies();
          cookies.set('isRegisterSuccessful','true');
          window.location.href = '/login';
        }
        
        if(res.status==400) alert('Ups!, por favor ingresa un nombre de usuario diferente');
      
        setLoading(false);
      }
    )
  }
    
  const onSubmit = (data:any) => {
    registerValidation(data);
  };

  return(
      <div className="row d-flex justify-content-center">
          <div className="col-md-6">
              <svg width="90" height="117" viewBox="0 0 90 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M45 0.473663C22.5 0.473663 0 41.2855 0 71.3947C0 96.3461 20.1214 116.526 45 116.526C69.8786 116.526 90 96.3461 90 71.3947C90 41.2855 67.5 0.473663 45 0.473663ZM51.4286 97.1842C32.1429 97.1842 19.2857 84.354 19.2857 64.9474C19.2857 61.4013 22.1786 58.5 25.7143 58.5C29.25 58.5 32.1429 61.4013 32.1429 64.9474C32.1429 83.7737 47.7 84.2895 51.4286 84.2895C54.9643 84.2895 57.8571 87.1908 57.8571 90.7368C57.8571 94.2829 54.9643 97.1842 51.4286 97.1842Z" fill="#FFDE0A"/>
              </svg>

              <form onSubmit={handleSubmit(onSubmit)}>

              <h1>Registro</h1>
              
              <div style={{marginTop:'20pt'}}>
                  <h3 > ¿Cómo te llamas? </h3>
                  <input defaultValue="test" {...register("display_name", { required: true })} autoComplete='off' className="form-control"/>

                  <h3 > Escoge tu nombre de usuario </h3>
                  <input defaultValue="test"
                    {...register("username", { required: true, 
                                              maxLength: {value: 15, 
                                                          message:'Ups!, solo pueden ser maximo 15 caracteres'},
                                              pattern:{value: /^[a-zA-Z0-9]+$/,
                                                      message:'Ups!, solo pueden ser letras y numeros'} })} autoComplete='off' className="form-control"/>
                  {errors.username && <span role="alert" style={{color:'red'}}>{errors.username.message}</span>}

                  {/* <h3 > ¿Cual es tu correo? </h3>
                  <input defaultValue="test" {...register("email", { required: true })} autoComplete='off' className="form-control" type={'email'}/> */}

                  <h3> Escoge una contraseña </h3>
                  <input {...register("password", { required: true, minLength:{value:6, message:'Ups!, tu contraseña debe contener mínimo 6 caracteres'} })} autoComplete='off' type={'password'} className="form-control"/>
                  {errors.password && <span role="alert" style={{color:'red'}}>{errors.password.message}</span>}
                  <br/>
                  <input className="btn btn-success btn-sm" type="submit" value="Crear cuenta"/>

                  
                  <div style={{paddingTop:'8pt'}}>
                  <a href="/login">O ingresa</a> ❤️
                  </div>
              </div>
              
              </form>
              {loading && <CircularProgress sx={{marginTop:'15px'}} color="secondary"/>}
          </div>
      </div>
    )
}