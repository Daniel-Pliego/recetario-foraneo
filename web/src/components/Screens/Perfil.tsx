import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import '../../styles/auth.css';

export const Perfil = () => {
    const [name,setName]  = useState('James');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors,isDirty }
      } = useForm({
        defaultValues: {
          name: 'James',
          password: 'verySecurePassword',
          userName: 'james',
          email: 'james@acompany.com',
        }
      });
    
      
    const onSubmit = (data:any) => {
        //console.log(data);
      window.location.href = '/perfil';
    };

    return(
      <div className="row d-flex justify-content-center">
        <div className="col-md-6">
          <svg width="20" height="26" viewBox="0 0 90 117" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45 0.473663C22.5 0.473663 0 41.2855 0 71.3947C0 96.3461 20.1214 116.526 45 116.526C69.8786 116.526 90 96.3461 90 71.3947C90 41.2855 67.5 0.473663 45 0.473663ZM51.4286 97.1842C32.1429 97.1842 19.2857 84.354 19.2857 64.9474C19.2857 61.4013 22.1786 58.5 25.7143 58.5C29.25 58.5 32.1429 61.4013 32.1429 64.9474C32.1429 83.7737 47.7 84.2895 51.4286 84.2895C54.9643 84.2895 57.8571 87.1908 57.8571 90.7368C57.8571 94.2829 54.9643 97.1842 51.4286 97.1842Z" fill="#AECFDF"/>
          </svg>
          <span style={{marginLeft:'4pt'}}>Hola {name}!</span>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{marginTop:'20pt'}}>
              <h3> ¿Deseas cambiar tu nombre? </h3>
              <input defaultValue="test" {...register("name", { required: true })} autoComplete='off' className="form-control"/>

              <h3> Escoge un nuevo nombre de usuario </h3>
              <input defaultValue="test"
                {...register("userName", { required: true, 
                                          maxLength: {value: 15, 
                                                      message:'Ups!, solo pueden ser maximo 15 caracteres'},
                                          pattern:{value: /^(?=.{1,15}$)(?![_.\s])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.\s])$/,
                                                  message:'Ups!, solo pueden ser letras y numeros'} })} autoComplete='off' className="form-control"/>
              {errors.userName && <span role="alert" style={{color:'red'}}>{errors.userName.message}</span>}

              <h3> ¿Nuevo correo? ¡Actualízalo! </h3>
              <input defaultValue="test" {...register("email", { required: true })} autoComplete='off' className="form-control" type={'email'}/>

              <h3> Escoge una nueva contraseña </h3>
              <input {...register("password", { required: true })} autoComplete='off' type={'password'} className="form-control"/>

              <br/>
              <input className="btn btn-success btn-sm" type="submit" value="Actualizar" disabled={!isDirty}/>
            </div>
          </form>
        </div>
      </div>
  )
}