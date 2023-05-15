import { useState } from 'react';

export default function UseForm(submit, values, callback) {

  const [formValues, setFormValues] = useState(values);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = (event, file) => {
    event.preventDefault();
    console.log(file)
    var form = new FormData();
    for (var key in formValues){
      form.append(key, formValues[key])
    }
    if(file != null) {
      form.append('file', file)
    }
    submit(form, callback);
  };

  return { formValues, handleChange, handleSubmit };
}

