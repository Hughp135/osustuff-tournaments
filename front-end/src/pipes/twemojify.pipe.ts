import { Pipe, PipeTransform } from '@angular/core';
import twemoji from 'twemoji';

@Pipe({ name: 'twemojify' })
export class TwemojifyPipe implements PipeTransform {
  constructor() { }
  transform(value: string): string {
    return twemoji.parse(value, { folder: 'svg', ext: '.svg' });
  }
}
