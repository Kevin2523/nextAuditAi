import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HelpCategory {
  title: string;
  desc: string;
  article: string;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-center.html',
})
export class HelpCenter {
  readonly query = signal('');
  readonly selectedTitle = signal('Primeros Pasos');

  readonly categories: HelpCategory[] = [
    {
      title: 'Primeros Pasos',
      desc: 'Conoce las secciones principales y revisa el estado inicial de la plataforma.',
      article:
        'Ingresa a la plataforma, revisa el Dashboard y confirma que el inventario muestre los dispositivos registrados. Si una seccion no tiene informacion, puede que aun no existan datos disponibles o que el administrador deba revisar la configuracion.',
    },
    {
      title: 'Seguimiento de Eventos',
      desc: 'Como revisar acciones correctivas y resultados recientes.',
      article:
        'Los eventos y acciones correctivas se consultan desde Registro de Actividad. Usa esta seccion para conocer el dispositivo afectado, el tipo de suceso, el resultado y la fecha del registro.',
    },
    {
      title: 'Auditorias y Reportes',
      desc: 'Interpretar las puntuaciones de riesgo y descargables.',
      article:
        'El reporte operativo se genera con la informacion disponible en la plataforma. Si algun dato no aparece, el reporte mantendra solo la informacion que este disponible al momento de la descarga.',
    },
    {
      title: 'Alertas Criticas',
      desc: 'Gestion y clasificacion de notificaciones en tiempo real.',
      article:
        'Las alertas provienen de vulnerabilidades y ejecuciones fallidas. Usa Inventario para revisar hosts en riesgo y Registro de Actividad para seguir la linea de tiempo.',
    },
  ];

  readonly filteredCategories = computed(() => {
    const text = this.query().trim().toLowerCase();
    if (!text) return this.categories;

    return this.categories.filter(
      (cat) =>
        cat.title.toLowerCase().includes(text) ||
        cat.desc.toLowerCase().includes(text) ||
        cat.article.toLowerCase().includes(text),
    );
  });

  readonly selectedCategory = computed(
    () => this.categories.find((cat) => cat.title === this.selectedTitle()) ?? this.categories[0],
  );

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value || '');
  }

  selectCategory(category: HelpCategory) {
    this.selectedTitle.set(category.title);
  }
}
