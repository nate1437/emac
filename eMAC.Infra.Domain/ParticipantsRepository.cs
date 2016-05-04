﻿using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class ParticipantsRepository : RepositoryBase, IParticipantsRepository
    {
        public ParticipantsRepository(IEmacDbContext context)
            :base(context)
        {

        }
    }
}
