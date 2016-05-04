using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using eMAC.Infra.Domain.Helpers;
using Microsoft.Practices.Unity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace eMAC.UI
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            var container = new UnityContainer();
            container.RegisterType<IEmacDbContext, eMacDbContext>(new HierarchicalLifetimeManager());
            container.RegisterType<IUserRepository, UserRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<ITestRepository, TestRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IMeetingRepository, MeetingRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<ILibraryRepository, LibraryRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IMeetingDetailRepository, MeetingDetailRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IParticipantsRepository, ParticipantsRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<ILinkagesRepository, LinkagesRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IRelatedMeetingRepository, RelatedMeetingRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IMeetingBudgetRepository, MeetingBudgetRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IMeetingActionHistoryRepository, MeetingActionHistoryRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IMeetingReportRepository, MeetingReportRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IParticipantIB2Repository, ParticipantsIB2Repository>(new HierarchicalLifetimeManager());
            container.RegisterType<IAttachmentsRepository, AttachmentsRepository>(new HierarchicalLifetimeManager());
            container.RegisterType<IActionHistoryRepository, ActionHistoryRepository>(new HierarchicalLifetimeManager());
            container.RegisterInstance<ISpireHelper>(new SpireHelper());//>(new HierarchicalLifetimeManager());
            config.DependencyResolver = new UnityResolver(container);


            config.Routes.MapHttpRoute(
                name: "NamedApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            config.Routes.MapHttpRoute(
                "Api", "service/{controller}/{action}");
            //config.Routes.MapHttpRoute(
            //    name: "ContactApi",
            //    routeTemplate: "api/{controller}/{action}/{year}"
            //);
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);
        }
    }
}
