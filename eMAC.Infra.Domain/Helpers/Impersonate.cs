using Impersonation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    internal class Impersonate : IDisposable
    {
        private static ImpersonateManager _manager = new ImpersonateManager();
        private string _user;
        private string _domain;
        private string _pass;
        public Impersonate(string user, string pass, string domain)
        {
            _user = user;
            _domain = domain;
            //_pass = new CryptLib.CryptLib().Decrypt3DES(pass);
            _pass = pass;
        }
        public bool isImpersonated()
        {
            return _manager.ImpersonateUser(_user, _domain, _pass);
        }

        public void Dispose()
        {
            if(isImpersonated())
                _manager.UndoImpersonation();
        }
    }
}
