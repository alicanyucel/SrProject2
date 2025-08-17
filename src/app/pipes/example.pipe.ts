import { Pipe, PipeTransform } from '@angular/core';
import { ExampleModel } from '../models/example.model';

@Pipe({
  name: 'example',
  pure: false,
  standalone: true
})
export class ExamplePipe implements PipeTransform {

  transform(value: ExampleModel[], search:string): ExampleModel[] {
    if(!search) return value;

    return value.filter(p=> 
      p.field1.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.field2.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }

}