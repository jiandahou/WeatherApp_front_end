import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
 export default async function CityPage(){
    const headersList = await headers();
    const lang = headersList.get('accept-language');
    if (!lang || lang.startsWith('zh')) {
       redirect("/weather/Beijing");
    }
    else if (lang.startsWith('ja')) {
       redirect("/weather/Tokyo");
    }
    else if (lang.startsWith('fr')) {
         redirect("/weather/Paris");
     }
    else if (lang.startsWith('es')) {
       redirect("/weather/Madrid");
    }
    else if (lang.startsWith('de')) {
       redirect("/weather/Berlin");
    }
    else if (lang.startsWith('ko')) {
       redirect("/weather/Seoul");
    }
    else if (lang.startsWith('ru')) {
       redirect("/weather/Moscow");
    }
    else if (lang.startsWith('en')) {
       redirect("/weather/Sydney");
    }
    else {
       redirect("/weather/Sydney");
    }
}