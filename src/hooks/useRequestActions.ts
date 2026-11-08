import { HeartHandshake } from 'lucide-react-native';

import { useFeedback } from '@/components/common/Feedback';
import { CanDonateTo } from '@/constants/bloodGroups';
import { useApp, useEligibility } from '@/store/AppStore';
import type { BloodRequest } from '@/types';

/** Shared respond / contact flows used by Home, Requests and Request Details. */
export function useRequestActions() {
  const { state, actions } = useApp();
  const { confirm, toast, contact } = useFeedback();
  const { eligible } = useEligibility();

  const hasResponded = (id: string) => state.respondedRequestIds.includes(id);

  const respond = (request: BloodRequest) => {
    if (hasResponded(request.id)) {
      toast('You have already responded to this request', 'info');
      return;
    }
    if (request.status === 'fulfilled') {
      toast('This request has already been fulfilled', 'info');
      return;
    }
    if (request.isMine) {
      toast('You cannot respond to your own request', 'info');
      return;
    }
    const compatible = CanDonateTo[state.user.bloodGroup].includes(request.bloodGroup);
    const warnings = [
      !compatible && `Your blood group (${state.user.bloodGroup}) is not compatible with ${request.bloodGroup}, but you can still help find donors.`,
      !eligible && 'You donated recently and may not be eligible yet.',
    ].filter(Boolean);

    confirm({
      title: 'Accept & Donate Blood?',
      message: `Are you sure you want to accept this request and donate ${request.bloodGroup} blood for ${request.patientName} at ${request.hospitalName}?${warnings.length ? `\n\n${warnings.join('\n')}` : ''}`,
      confirmLabel: 'Accept & Donate',
      icon: HeartHandshake,
      onConfirm: () => {
        actions.respondToRequest(request.id);
        toast('Request accepted. Please proceed to the hospital.');
      },
    });
  };

  const contactRequester = (request: BloodRequest) =>
    contact({ name: request.contactName, phone: request.contactPhone, subtitle: `${request.patientName} · ${request.hospitalName}` });

  return { respond, contactRequester, hasResponded };
}
